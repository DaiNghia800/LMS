"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function submitAssignment(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: "Not authenticated" };
    }

    const assignmentId = formData.get("assignmentId") as string;
    const fileUrl = formData.get("fileUrl") as string;
    const note = formData.get("note") as string;

    if (!assignmentId || !fileUrl) {
      return { error: "File is required to submit." };
    }

    // 1. Kiểm tra xem đã nộp chưa (Upsert Logic)
    const existingSubmission = await prisma.submission.findUnique({
      where: {
        assignmentId_studentId: {
          assignmentId: assignmentId,
          studentId: session.user.id,
        },
      },
      include: { assignment: true } // Lấy thêm thông tin bài tập để biết classId
    });

    let classId = "";

    if (existingSubmission) {
      // 2a. Update bài cũ
      classId = existingSubmission.assignment.classId;
      
      await prisma.submission.update({
        where: { id: existingSubmission.id },
        data: {
          fileUrl,
          textResponse: note,
          submittedAt: new Date(),
          // Nếu nộp lại file thì xóa điểm cũ đi (để giáo viên chấm lại)
          grade: null, 
          feedback: null
        },
      });
    } else {
      // 2b. Tạo bài nộp mới
      // Phải query assignment để lấy classId cho việc revalidate
      const assignment = await prisma.assignment.findUnique({
          where: { id: assignmentId }
      });
      
      if (!assignment) return { error: "Assignment not found" };
      classId = assignment.classId;

      await prisma.submission.create({
        data: {
          assignmentId,
          studentId: session.user.id,
          fileUrl,
          textResponse: note,
        },
      });
    }

    // 3. Refresh đúng trang Dashboard của lớp đó
    revalidatePath(`/dashboard/${classId}`);
    
    return { success: true };
  } catch (error) {
    console.error("Submission error:", error);
    return { error: "Failed to submit assignment" };
  }
}