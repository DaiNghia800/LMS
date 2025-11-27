"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type QuizAnswers = Record<string, string>;

export async function submitQuiz(assignmentId: string, answers: QuizAnswers) {
  try {
    const session = await auth();
    // 👇 FIX LỖI ĐỎ: Lấy ID ra biến riêng
    const currentUserId = (session?.user as any)?.id;
    const currentUserName = session?.user?.name || "Student";

    if (!currentUserId) return { error: "Unauthorized" };

    // 1. Lấy đề bài
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { questions: true, class: true } // Lấy thêm class để biết teacherId
    });

    if (!assignment) return { error: "Assignment not found" };

    // 2. Tính điểm tự động
    let correctCount = 0;
    let totalMultipleChoice = 0;
    let hasEssay = false;

    const answerData = assignment.questions.map((q) => {
      const studentAnswer = answers[q.id] || "";
      let isCorrect = false;

      if (q.type === "MULTIPLE_CHOICE") {
        totalMultipleChoice++;
        if (studentAnswer.trim().toUpperCase() === q.correctAnswer?.trim().toUpperCase()) {
            isCorrect = true;
            correctCount++;
        }
      } else if (q.type === "ESSAY") {
        hasEssay = true;
        isCorrect = false;
      }

      return {
        questionId: q.id,
        value: studentAnswer,
        isCorrect: q.type === "MULTIPLE_CHOICE" ? isCorrect : null,
      };
    });

    let initialGrade = 0;
    if (totalMultipleChoice > 0) {
        initialGrade = parseFloat(((correctCount / totalMultipleChoice) * 10).toFixed(1));
    }
    
    const finalGrade = hasEssay ? null : initialGrade;

    // 3. Transaction: Lưu bài + Tạo thông báo
    await prisma.$transaction(async (tx) => {
        // Xóa bài cũ nếu có (để nộp lại sạch sẽ)
        await tx.submission.deleteMany({
            where: {
                assignmentId: assignmentId,
                studentId: currentUserId
            }
        });

        // Tạo Submission mới
        const submission = await tx.submission.create({
            data: {
                assignmentId,
                studentId: currentUserId,
                grade: finalGrade,
                answers: {
                    createMany: { data: answerData }
                }
            }
        });

        // 👇 TẠO THÔNG BÁO CHO GIÁO VIÊN
        if (assignment.class.teacherId !== currentUserId) {
            await tx.notification.create({
                data: {
                    userId: assignment.class.teacherId,
                    message: `${currentUserName} completed quiz "${assignment.title}"`,
                    link: `/dashboard/${assignment.classId}/assignments/${assignmentId}/submissions/${submission.id}`,
                    isRead: false
                }
            });
        }
    });

    revalidatePath(`/dashboard/${assignment.classId}`);
    return { success: true };

  } catch (error) {
    console.error("Quiz submission error:", error);
    return { error: "Failed to submit quiz." };
  }
}