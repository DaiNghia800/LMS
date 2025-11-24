"use server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createClass(formData: FormData) {
  const session = await auth();
  
  if (!session || !session.user || !session.user.id) {
    return { error: "Not authenticated" };
  }
  const className = formData.get("className") as string;
  const description = formData.get("description") as string;
  
  if (!className) {
    return { error: "Class name is required" };
  }

  try {
    await prisma.class.create({
      data: {
        name: className,
        description: description,
        teacherId: session.user.id,
        inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
      },
    });
    revalidatePath("/dashboard");
    
    return { success: true };
  } catch (error) {
    console.error("Create class error:", error);
    return { error: "Failed to create class" };
  }
}

export async function joinClass(formData: FormData) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return { error: "Not authenticated" };
    }

    const inviteCode = formData.get("inviteCode") as string;
    if (!inviteCode) return { error: "Invite code is required" };

    const existingClass = await prisma.class.findUnique({
      where: { inviteCode: inviteCode },
    });

    if (!existingClass) {
      return { error: "Class not found! Please check the code." };
    }

    const existingMembership = await prisma.enrollment.findUnique({
      where: {
        userId_classId: {
          userId: session.user.id,
          classId: existingClass.id,
        },
      },
    });

    if (existingMembership) {
      return { error: "You are already in this class!" };
    }

    await prisma.enrollment.create({
      data: {
        userId: session.user.id,
        classId: existingClass.id,
      },
    });

    revalidatePath("/dashboard");
    return { success: true };

  } catch (error) {
    console.error("Join class error:", error);
    return { error: "Failed to join class" };
  }
}