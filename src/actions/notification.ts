"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { unstable_noStore as noStore } from "next/cache";
// Lấy danh sách thông báo
export async function getNotifications() {
    noStore();
    const session = await auth();
    if (!session?.user?.id) return [];
    return await prisma.notification.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: 10 // Lấy 10 cái mới nhất
    });
}

// Đánh dấu là đã đọc (Khi bấm vào chuông)
export async function markAllAsRead() {
    const session = await auth();
    if (!session?.user?.id) return;

    await prisma.notification.updateMany({
        where: { userId: session.user.id, isRead: false },
        data: { isRead: true }
    });

    revalidatePath("/dashboard");
}