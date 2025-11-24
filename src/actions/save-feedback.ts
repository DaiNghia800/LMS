"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function saveAnswerFeedback(answerId: string, feedback: string, path: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    // Cập nhật feedback vào bảng Answer (cột aiFeedback)
    await prisma.answer.update({
        where: { id: answerId },
        data: { aiFeedback: feedback } 
    });

    // Làm mới trang web để hiện dữ liệu mới ngay lập tức
    if (path) {
        revalidatePath(path);
    }

    return { success: true };
  } catch (error) {
    console.error("Save Feedback Error:", error);
    return { error: "Failed to save feedback" };
  }
}