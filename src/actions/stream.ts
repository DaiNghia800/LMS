"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// --- 1. ĐĂNG BÀI VIẾT MỚI (Sửa lại: Thêm logic thông báo vào đây) ---
export async function createPost(classId: string, content: string) {
  const session = await auth();
  const currentUserId = (session?.user as any)?.id; // Lấy ID chuẩn

  if (!currentUserId) return { error: "Unauthorized" };
  if (!content.trim()) return { error: "Content cannot be empty" };

  try {
    // A. Tạo bài viết
    const post = await prisma.post.create({
      data: {
        content,
        classId,
        authorId: currentUserId,
      },
    });
    
    // B. 👇 LOGIC THÔNG BÁO (Đã chuyển lên đây)
    // Lấy danh sách học sinh trong lớp
    const classMembers = await prisma.enrollment.findMany({
        where: { classId: classId },
        select: { userId: true }
    });

    // Tạo thông báo cho từng thành viên (Trừ người đăng)
    const notifications = classMembers
        .filter(member => member.userId !== currentUserId)
        .map(member => ({
            userId: member.userId,
            message: `New post in your class: "${content.substring(0, 30)}..."`,
            link: `/dashboard/${classId}?tab=stream#post-${post.id}`,
            isRead: false
        }));

    if (notifications.length > 0) {
        await prisma.notification.createMany({
            data: notifications
        });
    }
    // 👆 HẾT PHẦN THÔNG BÁO

    revalidatePath(`/dashboard/${classId}`); 
    return { success: true };
  } catch (error) {
    console.error("Post error:", error);
    return { error: "Failed to post" };
  }
}

// --- 2. BÌNH LUẬN (Đã xóa logic thông báo thừa) ---
export async function createComment(postId: string, content: string, classId: string) {
  const session = await auth();
  const currentUserId = (session?.user as any)?.id;
  
  if (!currentUserId) return { error: "Unauthorized" };
  if (!content.trim()) return { error: "Comment cannot be empty" };

  try {
    await prisma.comment.create({
      data: {
        content,
        postId,
        authorId: currentUserId,
      },
    });
    
    const post = await prisma.post.findUnique({
        where: { id: postId },
        select: { authorId: true, content: true }
    });

    if (post && post.authorId !== currentUserId) {
        await prisma.notification.create({
            data: {
                userId: post.authorId, // Gửi cho người đăng bài
                message: `${session?.user?.name || "Someone"} commented on your post: "${post.content.substring(0, 20)}..."`,
                link: `/dashboard/${classId}?tab=stream#post-${postId}`, // Link nhảy thẳng tới comment
                isRead: false
            }
        });
    }

    revalidatePath(`/dashboard/${classId}`);
    return { success: true };
  } catch (error) {
    console.error("Comment error:", error);
    return { error: "Failed to comment" };
  }
}

// --- 3. XÓA BÀI VIẾT (Giữ nguyên) ---
export async function deletePost(postId: string, classId: string) {
    const session = await auth();
    const currentUserId = (session?.user as any)?.id;
    if (!currentUserId) return { error: "Unauthorized" };

    try {
        const post = await prisma.post.findUnique({ 
            where: { id: postId },
            include: { class: true }
        });

        if (!post) return { error: "Post not found" };

        const isAuthor = post.authorId === currentUserId;
        const isTeacher = post.class.teacherId === currentUserId;

        if (!isAuthor && !isTeacher) {
            return { error: "You cannot delete this post" };
        }

        await prisma.post.delete({ where: { id: postId } });
        revalidatePath(`/dashboard/${classId}`);
        return { success: true };
    } catch (error) {
        return { error: "Failed to delete" };
    }
}