"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createPost } from "@/actions/stream";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";

export function CreatePostForm({ classId, userImage }: { classId: string, userImage?: string | null }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setLoading(true);
    
    const res = await createPost(classId, content);
    setLoading(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Posted successfully!");
      setContent("");
      setIsExpanded(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm mb-6">
        <div className="flex gap-4">
            <Avatar className="w-10 h-10 border border-primary/20">
                <AvatarImage src={userImage || ""} />
                <AvatarFallback>U</AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
                {!isExpanded ? (
                    <div 
                        className="w-full h-10 rounded-full bg-muted/50 border border-transparent hover:bg-muted/80 hover:border-primary/30 flex items-center px-4 text-sm text-muted-foreground cursor-pointer transition-all"
                        onClick={() => setIsExpanded(true)}
                    >
                        Announce something to your class...
                    </div>
                ) : (
                    <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
                        <Textarea 
                            placeholder="Share with your class..." 
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="min-h-[100px] bg-background border-primary/20 focus-visible:ring-primary text-base"
                            autoFocus
                        />
                        <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => setIsExpanded(false)}>Cancel</Button>
                            <Button 
                                size="sm" 
                                onClick={handleSubmit} 
                                disabled={loading || !content.trim()}
                                className="bg-primary text-primary-foreground hover:opacity-90"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4 mr-2"/> Post</>}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
}