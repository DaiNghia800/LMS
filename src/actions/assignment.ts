"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createAssignment(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: "Not authenticated" };

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

    if (classCheck?.teacherId !== session.user.id) {
      return { error: "Unauthorized: You are not the teacher" };
    }

    await prisma.assignment.create({
      data: {
        title,
        content,
        classId,
        dueDate: dueDateStr ? new Date(dueDateStr) : null,
        fileUrl: fileUrl || null,
        fileType: fileType || null,
      },
    });

    revalidatePath(`/dashboard/${classId}`);
    return { success: true };
  } catch (error) {
    console.error("Create assignment error:", error);
    return { error: "Failed to create assignment" };
  }
}