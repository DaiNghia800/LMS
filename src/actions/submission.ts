"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function submitAssignment(formData: FormData) {
  try {
    const session = await auth();
    // 👇 FIX LỖI ĐỎ: Lấy ID ra biến riêng ngay từ đầu
    const currentUserId = (session?.user as any)?.id;
    const currentUserName = session?.user?.name || "Student";

    if (!currentUserId) {
        return { error: "Not authenticated" };
    }

    const assignmentId = formData.get("assignmentId") as string;
    const fileUrl = formData.get("fileUrl") as string;
    const note = formData.get("note") as string;

    if (!assignmentId || !fileUrl) {
      return { error: "File is required to submit." };
    }

    // 1. Lấy thông tin bài tập để biết ai là Giáo viên
    const assignment = await prisma.assignment.findUnique({
        where: { id: assignmentId },
        include: { class: true } 
    });

    if (!assignment) return { error: "Assignment not found" };

    // 2. Kiểm tra xem đã nộp chưa (Upsert)
    const existingSubmission = await prisma.submission.findUnique({
      where: {
        assignmentId_studentId: {
          assignmentId: assignmentId,
          studentId: currentUserId, // Dùng biến này thay vì session.user.id
        },
      },
    });

    let submissionId = "";

    if (existingSubmission) {
      // Update
      const updated = await prisma.submission.update({
        where: { id: existingSubmission.id },
        data: {
          fileUrl,
          textResponse: note,
          submittedAt: new Date(),
          grade: null, // Reset điểm nếu nộp lại
          feedback: null
        },
      });
      submissionId = updated.id;
    } else {
      // Create
      const created = await prisma.submission.create({
        data: {
          assignmentId,
          studentId: currentUserId,
          fileUrl,
          textResponse: note,
        },
      });
      submissionId = created.id;
    }

    // 3. 👇 TẠO THÔNG BÁO CHO GIÁO VIÊN
    // (Chỉ thông báo nếu người nộp không phải là giáo viên tự test)
    if (assignment.class.teacherId !== currentUserId) {
        await prisma.notification.create({
            data: {
                userId: assignment.class.teacherId, // Gửi cho thầy
                message: `${currentUserName} submitted file for "${assignment.title}"`,
                // Link dẫn thẳng tới trang chấm bài
                link: `/dashboard/${assignment.classId}/assignments/${assignmentId}/submissions/${submissionId}`,
                isRead: false
            }
        });
    }

    revalidatePath(`/dashboard/${assignment.classId}`);
    
    return { success: true };
  } catch (error) {
    console.error("Submission error:", error);
    return { error: "Failed to submit assignment" };
  }
}