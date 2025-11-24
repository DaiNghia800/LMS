"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { generateQuestionsFromFile } from "@/actions/ai-generate";
import { Loader2, Sparkles, Upload } from "lucide-react";
import { toast } from "sonner";

interface Props {
  onImport: (questions: any[]) => void; // Hàm để đẩy dữ liệu ra ngoài cho cha dùng
}

export function AIImportButton({ onImport }: Props) {
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    const formData = new FormData();
    // Gửi file trực tiếp qua FormData
    formData.append("file", file); 

    const res = await generateQuestionsFromFile(formData);

    setIsLoading(false);
    
    if (res?.error) { // Sử dụng Optional Chaining để xử lý lỗi
      toast.error(res.error);
    } else if (res?.data) {
      toast.success(`✨ Success! AI generated ${res.data.length} questions.`);
      onImport(res.data); // Gửi dữ liệu ra ngoài để cập nhật vào danh sách
    }
    
    // Reset input file
    e.target.value = ""; 
  };

  return (
    <div>
      <input
        type="file"
        id="ai-upload-input"
        className="hidden"
        accept=".pdf,.docx"
        onChange={handleFileUpload}
      />
      <label htmlFor="ai-upload-input">
        <Button 
            variant="outline" 
            type="button" // Quan trọng: Để không bị submit nhầm form cha
            className="border-dashed border-primary text-primary hover:bg-primary/10 gap-2"
            disabled={isLoading}
            asChild
        >
          <span>
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Import from PDF (AI)
          </span>
        </Button>
      </label>
    </div>
  );
}