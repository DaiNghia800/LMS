"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// --- HÀM LƯU CÂU HỎI (VÀ TẠO THÔNG BÁO) ---
export async function saveQuestions(assignmentId: string, questions: any[]) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: "Not authenticated" };

    // 1. Kiểm tra quyền giáo viên & Lấy thông tin lớp
    const assignment = await prisma.assignment.findUnique({
        where: { id: assignmentId },
        include: { class: true }
    });

    if (!assignment) return { error: "Assignment not found" };

    if (assignment.class.teacherId !== session.user.id) {
        return { error: "Unauthorized" };
    }

    // 2. Transaction: Xóa cũ -> Thêm mới -> Tạo thông báo
    await prisma.$transaction(async (tx) => {
        // A. Xóa câu hỏi cũ
        await tx.question.deleteMany({
            where: { assignmentId }
        });

        // B. Thêm câu hỏi mới
        if (questions.length > 0) {
            await tx.question.createMany({
                data: questions.map((q) => ({
                    assignmentId,
                    text: q.text,
                    type: q.type,
                    options: q.options || [],
                    correctAnswer: q.correctAnswer,
                    points: q.points || 1,
                    mediaUrl: q.mediaUrl || null,
                    mediaType: q.mediaType || null,
                }))
            });

            // C. 👇 GỬI THÔNG BÁO CẬP NHẬT CHO HỌC SINH
            // Lấy danh sách học sinh trong lớp
            const students = await tx.enrollment.findMany({
                where: { classId: assignment.classId },
                select: { userId: true }
            });

            // Tạo thông báo
            const notifications = students
                .filter(s => s.userId !== session?.user?.id)
                .map(s => ({
                    userId: s.userId,
                    message: `Questions updated for assignment: "${assignment.title}". Check it out!`,
                    // Link nhảy thẳng vào trang làm bài
                    link: `/dashboard/${assignment.classId}/assignments/${assignment.id}/take`, 
                    isRead: false
                }));

            if (notifications.length > 0) {
                await tx.notification.createMany({ data: notifications });
            }
        }
    });

    // Refresh lại trang để cập nhật dữ liệu mới
    revalidatePath(`/dashboard/${assignment.classId}`);
    return { success: true };

  } catch (error) {
    console.error("Save questions error:", error);
    return { error: "Failed to save questions" };
  }
}

// --- HÀM LẤY CÂU HỎI (Dùng cho Client Component nếu cần) ---
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

    // Chỉ giáo viên dạy lớp mới được xem câu hỏi (khi edit)
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