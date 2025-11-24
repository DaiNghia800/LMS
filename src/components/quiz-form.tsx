"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, CheckCircle, Mic } from "lucide-react";
import { submitQuiz } from "@/actions/quiz-submission"; // Hàm vừa tạo ở trên

interface Question {
  id: string;
  text: string;
  type: "MULTIPLE_CHOICE" | "ESSAY";
  options: string[];
  mediaUrl?: string | null;
  mediaType?: "AUDIO" | "IMAGE" | "NONE" | null;
}

interface Props {
  assignmentId: string;
  classId: string;
  questions: Question[];
}

export function QuizForm({ assignmentId, classId, questions }: Props) {
  // State lưu câu trả lời: { "id_cau_hoi": "dap_an" }
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAnswerChange = (qId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: value }));
  };

  const handleSubmit = async () => {
    // Kiểm tra làm đủ chưa (Tùy chọn)
    if (Object.keys(answers).length < questions.length) {
        const confirm = window.confirm("You haven't answered all questions. Submit anyway?");
        if (!confirm) return;
    }

    setLoading(true);
    const res = await submitQuiz(assignmentId, answers);
    
    if (res?.success) {
        toast.success("Quiz submitted successfully! 🎉");
        router.push(`/dashboard/${classId}`); // Quay về lớp
        router.refresh();
    } else {
        toast.error(res?.error || "Something went wrong");
        setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {questions.map((q, index) => (
        <Card key={q.id} className="border-l-4 border-l-primary/60 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-start gap-3">
                <Badge variant="outline" className="text-base px-3 py-1 h-fit mt-1">
                    Q{index + 1}
                </Badge>
                <div className="flex-1">
                    <CardTitle className="text-lg font-medium text-foreground leading-relaxed">
                        {q.text}
                    </CardTitle>
                    
                    {/* --- HIỂN THỊ MEDIA (AUDIO/ẢNH) NẾU CÓ --- */}
                    {q.mediaUrl && (
                        <div className="mt-4 p-3 bg-muted/30 rounded-lg border w-fit">
                            {q.mediaType === "AUDIO" && (
                                <div className="flex items-center gap-2">
                                    <div className="bg-primary/10 p-2 rounded-full">
                                        <Mic className="w-4 h-4 text-primary" />
                                    </div>
                                    <audio controls src={q.mediaUrl} className="h-8 w-full max-w-md" />
                                </div>
                            )}
                            {q.mediaType === "IMAGE" && (
                                <img 
                                    src={q.mediaUrl} 
                                    alt="Question Media" 
                                    className="max-h-64 rounded-md object-contain"
                                />
                            )}
                        </div>
                    )}
                </div>
            </div>
          </CardHeader>

          <CardContent className="pt-2 pl-14">
            {/* TRẮC NGHIỆM */}
            {q.type === "MULTIPLE_CHOICE" && (
              <RadioGroup onValueChange={(val : string) => handleAnswerChange(q.id, val)}>
                <div className="grid grid-cols-1 gap-3">
                    {q.options.map((opt, i) => {
                        const char = String.fromCharCode(65 + i); // A, B, C, D
                        return (
                            <div key={i} className="flex items-center space-x-3 border p-3 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors">
                                <RadioGroupItem value={char} id={`q${q.id}-opt${i}`} />
                                <Label htmlFor={`q${q.id}-opt${i}`} className="flex-1 cursor-pointer font-normal text-base">
                                    <span className="font-bold text-primary mr-2">{char}.</span> {opt}
                                </Label>
                            </div>
                        );
                    })}
                </div>
              </RadioGroup>
            )}

            {/* TỰ LUẬN */}
            {q.type === "ESSAY" && (
              <Textarea 
                placeholder="Type your answer here..." 
                className="min-h-[120px] text-base bg-background"
                onChange={(e) => handleAnswerChange(q.id, e.target.value)}
              />
            )}
          </CardContent>
        </Card>
      ))}

      {/* NÚT NỘP BÀI (Fixed bottom hoặc để dưới cùng) */}
      <div className="flex justify-end pt-6 border-t">
        <Button size="lg" onClick={handleSubmit} disabled={loading} className="px-8 text-lg">
            {loading ? <Loader2 className="animate-spin mr-2" /> : <CheckCircle className="mr-2" />}
            Submit Assignment
        </Button>
      </div>
    </div>
  );
}