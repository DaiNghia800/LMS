"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function gradeSubmission(formData: FormData) {
  const submissionId = formData.get("submissionId") as string;
  const gradeStr = formData.get("grade") as string;
  const feedback = formData.get("feedback") as string;

  const session = await auth();
  if (!session || !submissionId || !gradeStr) {
    return { error: "Error: Missing data." };
  }
  
  const grade = parseFloat(gradeStr);
  
  try {
    // Lưu vào DB
    await prisma.submission.update({
      where: { id: submissionId },
      data: {
        grade: grade,
        feedback: feedback,
        gradedAt: new Date(),
      },
    });

    // Refresh lại trang để thấy điểm mới
    // (Mẹo: Dùng revalidatePath cho cả dashboard để chắc ăn)
    revalidatePath("/dashboard");
    return { success: true };

  } catch (error) {
    return { error: "Failed to save grade." };
  }
}