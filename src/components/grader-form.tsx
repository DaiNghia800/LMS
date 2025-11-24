"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Save, Loader2 } from "lucide-react";
import { gradeSubmission } from "@/actions/grading";
import { toast } from "sonner";

interface GraderFormProps {
  submissionId: string;
  initialGrade: number | null;
  initialFeedback: string | null;
}

export function GraderForm({ submissionId, initialGrade, initialFeedback }: GraderFormProps) {
  // State quản lý dữ liệu form
  const [grade, setGrade] = useState<number | string>(initialGrade !== null ? initialGrade : "");
  const [feedback, setFeedback] = useState<string>(initialFeedback || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    
    // Chuẩn bị dữ liệu gửi đi
    formData.set("submissionId", submissionId);
    formData.set("grade", grade.toString());
    formData.set("feedback", feedback);

    // Gọi Server Action
    const res = await gradeSubmission(formData);
    setIsLoading(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Grade saved successfully!");
    }
  };

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label className="font-bold text-primary">Final Grade (0-10)</Label>
        <Input 
          type="number" 
          min="0" max="10" step="0.1"
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
          required
          placeholder="e.g. 8.5"
          className="text-3xl font-extrabold h-16 text-center bg-background border-2 border-primary/20 focus-visible:ring-primary"
        />
      </div>
      
      <div className="space-y-2">
        <Label>Overall Feedback</Label>
        <Textarea 
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="General comments for the student..."
          className="min-h-[120px]"
        />
      </div>
      
      <Button type="submit" disabled={isLoading} className="w-full gap-2 h-12 text-lg font-bold">
        {isLoading ? <Loader2 className="w-5 h-5 animate-spin"/> : <Save className="w-5 h-5"/>}
        Save Grade
      </Button>
    </form>
  );
}