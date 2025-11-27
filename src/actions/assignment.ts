"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createAssignment(formData: FormData) {
  try {
    const session = await auth();
    const currentUserId = (session?.user as any)?.id;
    if (!currentUserId) {
      return { error: "Not authenticated" };
  }

    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const classId = formData.get("classId") as string;
    const dueDateStr = formData.get("dueDate") as string;
    const fileUrl = formData.get("fileUrl") as string;
    const fileType = formData.get("fileType") as string;

    if (!title || !classId) {
      return { error: "Title and Class ID are required" };
    }

    const classCheck = await prisma.class.findUnique({
      where: { id: classId },
    });

    let finalDueDate = null;
    if (dueDateStr && dueDateStr !== "") {
        finalDueDate = new Date(dueDateStr);
    }

    if (classCheck?.teacherId !== currentUserId) {
      return { error: "Unauthorized: You are not the teacher" };
    }

    const newAssignment = await prisma.assignment.create({
      data: {
        title,
        content,
        classId,
        dueDate: dueDateStr ? new Date(dueDateStr) : null,
        fileUrl: fileUrl || null,
        fileType: fileType || null,
      },
    });

    const students = await prisma.enrollment.findMany({
        where: { classId: classId },
        select: { userId: true }
    });

    const notifications = students
        // 👇 3. Dùng biến currentUserId ở đây là hết đỏ
        .filter(s => s.userId !== currentUserId)
        .map(s => ({
            userId: s.userId,
            message: `New Assignment: "${title}" assigned to you.`,
            link: `/dashboard/${classId}/assignments/${newAssignment.id}`,
            isRead: false
        }));

    // 3. Lưu vào DB
    if (notifications.length > 0) {
        await prisma.notification.createMany({ data: notifications });
    }

    revalidatePath(`/dashboard/${classId}`);
    return { success: true };
  } catch (error) {
    console.error("Create assignment error:", error);
    return { error: "Failed to create assignment" };
  }
}