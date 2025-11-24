"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles, Save } from "lucide-react";
import { reviewEssay } from "@/actions/ai-essay-review";
import { saveAnswerFeedback } from "@/actions/save-feedback";
import { toast } from "sonner";
import { usePathname } from "next/navigation";

interface Props {
  answerId: string;
  studentAnswer: string;
  initialFeedback?: string | null;
}

export function EssayGrader({ answerId, studentAnswer, initialFeedback }: Props) {
  const [feedback, setFeedback] = useState(initialFeedback || "");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const pathname = usePathname();

  // Gọi AI chấm
  const handleAskAI = async () => {
    setIsAiLoading(true);
    const res = await reviewEssay(answerId);
    setIsAiLoading(false);

    if (res.success && res.feedback) {
      setFeedback(res.feedback);
      toast.success("AI Generated Feedback!");
    } else {
      toast.error("AI Error.");
    }
  };

  // Lưu Feedback
  const handleSave = async () => {
    setIsSaving(true);
    await saveAnswerFeedback(answerId, feedback, pathname);
    setIsSaving(false);
    toast.success("Feedback Saved!");
  };

  return (
    <div className="mt-4 border pt-4 bg-primary/5 p-4 rounded-lg">
      <div className="flex justify-between items-center mb-2">
        <Label className="text-sm font-bold text-primary">Teacher's Feedback</Label>
        <Button variant="outline" size="sm" onClick={handleAskAI} disabled={isAiLoading} className="h-8 gap-2 bg-white">
            {isAiLoading ? <Loader2 className="w-3 h-3 animate-spin"/> : <Sparkles className="w-3 h-3 text-purple-600"/>}
            Auto-Review (AI)
        </Button>
      </div>
      <Textarea 
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder="Write feedback or use AI..."
        className="min-h-[300px] bg-white"
      />
      <div className="flex justify-end mt-2">
        <Button size="sm" onClick={handleSave} disabled={isSaving} className="gap-2">
            {isSaving ? <Loader2 className="w-3 h-3 animate-spin"/> : <Save className="w-3 h-3"/>}
            Save
        </Button>
      </div>
    </div>
  );
}