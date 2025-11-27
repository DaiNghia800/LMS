"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDistanceToNow } from "date-fns";
import { createComment, deletePost } from "@/actions/stream";
import { toast } from "sonner";
import { Trash2, MessageSquare, Send, Loader2 } from "lucide-react";

// 👇 1. Import AlertDialog
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface PostWithAuthor {
    id: string;
    content: string;
    createdAt: Date;
    author: { name: string | null; image: string | null; id: string };
    comments: {
        id: string;
        content: string;
        createdAt: Date;
        author: { name: string | null; image: string | null };
    }[];
}

export function StreamFeed({ posts, classId, currentUserId, currentUserImage }: { posts: PostWithAuthor[], classId: string, currentUserId: string, currentUserImage?: string | null }) {
    return (
        <div className="space-y-6">
            {posts.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground italic">No posts yet. Be the first to say hi! 👋</div>
            ) : (
                posts.map((post) => (
                    <PostItem 
                        key={post.id} 
                        post={post} 
                        classId={classId} 
                        currentUserId={currentUserId} 
                        currentUserImage={currentUserImage}
                    />
                ))
            )}
        </div>
    );
}

function PostItem({ post, classId, currentUserId, currentUserImage }: { post: PostWithAuthor, classId: string, currentUserId: string, currentUserImage?: string | null }) {
    const [commentText, setCommentText] = useState("");
    const [loading, setLoading] = useState(false);
    const [showComments, setShowComments] = useState(false);

    const handleComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!commentText.trim()) return;
        
        setLoading(true);
        const res = await createComment(post.id, commentText, classId);
        setLoading(false);
        
        if(res.error) toast.error(res.error);
        else {
            setCommentText("");
            setShowComments(true); 
        }
    };

    // 👇 2. Hàm xóa (Bỏ confirm cũ đi, chỉ giữ logic xóa)
    const handleDelete = async () => {
        const res = await deletePost(post.id, classId);
        if(res.error) toast.error(res.error);
        else toast.success("Post deleted successfully!");
    }

    return (
        <div id={`post-${post.id}`} className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-3">
                <div className="flex gap-3">
                    <Avatar className="w-10 h-10 border border-muted">
                        <AvatarImage src={post.author.image || ""} />
                        <AvatarFallback>{post.author.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-bold text-sm text-foreground">{post.author.name}</p>
                        <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</p>
                    </div>
                </div>

                {/* 👇 3. Bọc nút xóa bằng AlertDialog */}
                {post.author.id === currentUserId && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete this post?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete your post and remove it from the class stream.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                    onClick={handleDelete}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                    Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </div>

            <div className="text-foreground mb-4 whitespace-pre-wrap text-sm leading-relaxed pl-[52px]">
                {post.content}
            </div>
            
            <div className="border-t border-border pt-2 pl-[52px]">
                <button 
                    className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 mb-3 transition-colors"
                    onClick={() => setShowComments(!showComments)}
                >
                    <MessageSquare className="w-3 h-3"/> {post.comments.length} comments
                </button>

                {showComments && (
                    <div className="space-y-3 mb-4 animate-in slide-in-from-top-2">
                        {post.comments.map(comment => (
                            <div key={comment.id} className="flex gap-2">
                                <Avatar className="w-6 h-6 mt-1">
                                    <AvatarImage src={comment.author.image || ""} />
                                    <AvatarFallback className="text-[10px]">{comment.author.name?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="bg-muted/50 p-2 rounded-lg rounded-tl-none text-sm flex-1">
                                    <span className="font-bold text-xs block text-foreground/80">{comment.author.name}</span>
                                    <span className="text-foreground">{comment.content}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <form onSubmit={handleComment} className="flex gap-2 relative items-center">
                    <Avatar className="w-8 h-8">
                        <AvatarImage src={currentUserImage || ""} />
                        <AvatarFallback>ME</AvatarFallback>
                    </Avatar>
                    <div className="relative flex-1">
                        <Input 
                            placeholder="Write a comment..." 
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            className="h-9 pr-10 text-sm rounded-full bg-background focus-visible:ring-primary"
                        />
                        <button 
                            type="submit" 
                            disabled={loading || !commentText.trim()}
                            className="absolute right-1 top-1 bottom-1 aspect-square text-primary hover:text-primary/80 disabled:opacity-50 hover:bg-primary/10 rounded-full flex items-center justify-center transition-colors"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Send className="w-4 h-4"/>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}