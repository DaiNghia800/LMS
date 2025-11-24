"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Dữ liệu gửi lên: Key là ID câu hỏi, Value là câu trả lời
type QuizAnswers = Record<string, string>;

export async function submitQuiz(
  assignmentId: string, 
  answers: QuizAnswers
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    // 1. Lấy đề bài và đáp án chuẩn từ DB
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { questions: true }
    });

    if (!assignment) return { error: "Assignment not found" };

    // 2. Logic Tự động chấm điểm (Auto-grading)
    let correctCount = 0;
    let totalMultipleChoice = 0;
    let hasEssay = false;

    // Chuẩn bị dữ liệu để lưu
    const answerData = assignment.questions.map((q) => {
      const studentAnswer = answers[q.id] || ""; // Lấy câu trả lời của HS
      let isCorrect = false;

      if (q.type === "MULTIPLE_CHOICE") {
        totalMultipleChoice++;
        // So sánh đáp án (Không phân biệt hoa thường)
        if (studentAnswer.trim().toUpperCase() === q.correctAnswer?.trim().toUpperCase()) {
            isCorrect = true;
            correctCount++;
        }
      } else if (q.type === "ESSAY") {
        hasEssay = true;
        isCorrect = false; // Tự luận mặc định là sai/chưa chấm, chờ giáo viên
      }

      return {
        questionId: q.id,
        value: studentAnswer,
        isCorrect: q.type === "MULTIPLE_CHOICE" ? isCorrect : null, // Null nếu là tự luận
      };
    });

    // Tính điểm tạm thời (Thang 10)
    // Nếu bài có tự luận, điểm này chỉ là điểm trắc nghiệm tạm thời
    let initialGrade = 0;
    if (totalMultipleChoice > 0) {
        initialGrade = parseFloat(((correctCount / totalMultipleChoice) * 10).toFixed(1));
    }
    
    // Nếu bài toàn tự luận -> Điểm là null (Chờ chấm)
    // Nếu bài hỗn hợp -> Lưu điểm trắc nghiệm trước
    const finalGrade = hasEssay ? null : initialGrade;

    // 3. Lưu vào Database
    await prisma.submission.create({
      data: {
        assignmentId,
        studentId: session.user.id,
        grade: finalGrade, // Lưu điểm
        answers: {
            createMany: {
                data: answerData
            }
        }
      }
    });

    // Refresh lại Dashboard để hiện trạng thái "Đã nộp"
    revalidatePath(`/dashboard`);
    return { success: true };

  } catch (error) {
    console.error("Quiz submission error:", error);
    return { error: "Failed to submit quiz. Please try again." };
  }
}