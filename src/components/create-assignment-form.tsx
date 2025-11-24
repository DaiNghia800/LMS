"use client"; 

import { createAssignment } from "@/actions/assignment";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DialogFooter } from "@/components/ui/dialog";
import { UploadButton } from "@/lib/uploadthing"; 
import { useState } from "react";
import { Loader2, FileIcon, X } from "lucide-react";
import { toast } from "sonner";
interface Props {
  classId: string;
  onSuccess?: () => void; 
}

export function CreateAssignmentForm({ classId, onSuccess }: Props) {
  // State để lưu link file sau khi upload xong
  const [fileUrl, setFileUrl] = useState<string>("");
  const [fileType, setFileType] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    // 1. Nhét thêm thông tin file vào formData
    if (fileUrl) {
        formData.append("fileUrl", fileUrl);
        formData.append("fileType", fileType);
    }

    // 2. Gọi Server Action
    const res = await createAssignment(formData);
    
    setIsLoading(false);
    if (res?.error) {
      alert(`Error: ${res.error}`);
    } else {
      toast.success("Assignment created successfully!", {
        description: "Your students can now see this assignment.",
      });
      if (onSuccess) onSuccess();
      setFileUrl("");
      setFileName("");
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4 py-4">
      <input type="hidden" name="classId" value={classId} />
      
      {/* Title */}
      <div className="space-y-2">
        <Label>Title <span className="text-red-500">*</span></Label>
        <Input name="title" required placeholder="e.g. Listen and Answer" />
      </div>
      
      {/* Content */}
      <div className="space-y-2">
        <Label>Instructions</Label>
        <Textarea name="content" placeholder="Write details here..." className="min-h-[100px]" />
      </div>

      {/* UPLOAD SECTION - ĐIỂM NHẤN */}
      <div className="space-y-2">
        <Label>Attachment (Audio/PDF/Word)</Label>
        
        {!fileUrl ? (
            // GIAO DIỆN KHI CHƯA UP FILE
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition">
                <UploadButton
                    endpoint="classAttachment"
                    appearance={{
                        button: "bg-primary text-primary-foreground hover:opacity-90 ut-uploading:cursor-not-allowed",
                        allowedContent: "text-gray-500 text-xs"
                    }}
                    onClientUploadComplete={(res) => {
                        console.log("Files: ", res);
                        setFileUrl(res[0].url);
                        setFileName(res[0].name);
                        setFileType(res[0].name.split('.').pop() || "file");
                    }}
                    onUploadError={(error: Error) => {
                        alert(`ERROR! ${error.message}`);
                    }}
                />
            </div>
        ) : (
            // GIAO DIỆN KHI ĐÃ UP FILE XONG (Hiện tên file + Nút xóa)
            <div className="flex items-center justify-between p-3 border rounded-lg bg-green-50 border-green-200">
                <div className="flex items-center gap-2 overflow-hidden">
                    <FileIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-green-700 truncate font-medium">{fileName}</span>
                </div>
                <button 
                    type="button"
                    onClick={() => { setFileUrl(""); setFileName(""); }}
                    className="text-gray-400 hover:text-red-500 transition"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
        )}
      </div>

      {/* Due Date */}
      <div className="space-y-2">
        <Label>Due Date</Label>
        <Input name="dueDate" type="datetime-local" className="w-full" />
      </div>

      <DialogFooter>
        <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
          {isLoading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</>
          ) : (
            "Publish Assignment"
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}