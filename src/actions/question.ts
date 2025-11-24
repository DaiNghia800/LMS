"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function saveQuestions(assignmentId: string, questions: any[]) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: "Not authenticated" };

    // 1. Kiểm tra quyền giáo viên (Bảo mật)
    const assignment = await prisma.assignment.findUnique({
        where: { id: assignmentId },
        include: { class: true }
    });

    if (assignment?.class.teacherId !== session.user.id) {
        return { error: "Unauthorized" };
    }

    // 2. Transaction: Xóa câu hỏi cũ -> Thêm câu hỏi mới
    // (Cách đơn giản nhất để xử lý việc sửa/xóa/thêm cùng lúc)
    await prisma.$transaction(async (tx) => {
        // Xóa hết câu cũ của bài này
        await tx.question.deleteMany({
            where: { assignmentId }
        });

        // Thêm lại danh sách mới
        if (questions.length > 0) {
            await tx.question.createMany({
                data: questions.map((q) => ({
                    assignmentId,
                    text: q.text,
                    type: q.type, // "MULTIPLE_CHOICE" hoặc "ESSAY"
                    options: q.options || [],
                    correctAnswer: q.correctAnswer,
                    mediaUrl: q.mediaUrl || null,
                    mediaType: q.mediaType || null,
                    points: 1, // Mặc định 1 điểm
                }))
            });
        }
    });

    revalidatePath(`/dashboard/${assignment.classId}`);
    return { success: true };

  } catch (error) {
    console.error("Save questions error:", error);
    return { error: "Failed to save questions" };
  }
}
export async function getQuestions(assignmentId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: "Not authenticated" };

    // Lấy assignment + class để kiểm tra giáo viên
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { class: true },
    });

    if (!assignment) return { error: "Assignment not found" };

    // Chỉ giáo viên dạy lớp mới được xem câu hỏi
    if (assignment.class.teacherId !== session.user.id) {
      return { error: "Unauthorized" };
    }

    // Lấy câu hỏi từ Prisma
    const questions = await prisma.question.findMany({
      where: { assignmentId },
      orderBy: { createdAt: "asc" },
    });

    return { success: true, questions };

  } catch (err) {
    console.error("Get questions error:", err);
    return { error: "Failed to fetch questions" };
  }
}