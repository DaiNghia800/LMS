"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DialogFooter } from "@/components/ui/dialog";
import { UploadButton } from "@/lib/uploadthing"; // Nút upload của bạn
import { Loader2, FileIcon, X, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { submitAssignment } from "@/actions/submission"; // Hàm Server Action nộp bài

interface Props {
  assignmentId: string;
  defaultNote?: string; // Lời nhắn cũ (nếu đã nộp rồi)
  onSuccess?: () => void; // Hàm đóng cửa sổ sau khi nộp xong
}

export function SubmitAssignmentForm({ assignmentId, defaultNote, onSuccess }: Props) {
  const [fileUrl, setFileUrl] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    // 1. Kiểm tra xem đã up file chưa (Bắt buộc)
    if (!fileUrl) {
      toast.error("Please upload your homework file first!");
      return;
    }

    setIsLoading(true);
    
    // 2. Gắn link file vào dữ liệu gửi đi
    formData.append("fileUrl", fileUrl);
    
    try {
        // 3. Gọi Server Action
        const res = await submitAssignment(formData);
        
        if (res?.error) {
            toast.error(res.error);
        } else {
            toast.success("🎉 Work submitted successfully!");
            // Đóng dialog (nếu có hàm đóng truyền vào)
            if (onSuccess) onSuccess();
        }
    } catch (error) {
        toast.error("Something went wrong");
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4 py-4">
      <input type="hidden" name="assignmentId" value={assignmentId} />

      {/* KHU VỰC UPLOAD FILE BÀI LÀM */}
      <div className="space-y-2">
        <Label>Your Work (File) <span className="text-destructive">*</span></Label>
        
        {!fileUrl ? (
          // CHƯA CÓ FILE -> HIỆN NÚT UPLOAD
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 flex justify-center bg-muted/30 hover:bg-muted/50 transition">
            <UploadButton
              endpoint="classAttachment"
              appearance={{
                button: "bg-primary text-primary-foreground hover:opacity-90 ut-uploading:cursor-not-allowed",
                allowedContent: "text-muted-foreground text-xs"
              }}
              onClientUploadComplete={(res) => {
                if (res && res[0]) {
                  setFileUrl(res[0].url);
                  setFileName(res[0].name);
                  toast.success("File attached!");
                }
              }}
              onUploadError={(error: Error) => {
                toast.error(error.message)
              }}
            />
          </div>
        ) : (
          // ĐÃ CÓ FILE -> HIỆN THẺ XANH
          <div className="flex items-center gap-3 p-3 border rounded-lg bg-primary/10 border-primary/20">
            <div className="bg-primary/20 p-2 rounded-full">
                <CheckCircle2 className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium text-foreground truncate">{fileName || "Uploaded File"}</p>
                <p className="text-xs text-muted-foreground">Ready to submit</p>
            </div>
            <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                onClick={() => { setFileUrl(""); setFileName(""); }}
            >
                <X className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* LỜI NHẮN CHO GIÁO VIÊN */}
      <div className="space-y-2">
        <Label>Private Note to Teacher</Label>
        <Textarea 
            name="note" 
            placeholder="Hi teacher, I found this task..." 
            defaultValue={defaultNote}
            className="min-h-[100px]"
        />
      </div>

      <DialogFooter>
        <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
          {isLoading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
          ) : (
            "Turn In Assignment"
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}