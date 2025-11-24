"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Sparkles, Loader2, Mic } from "lucide-react";
import { generateAiFeedback } from "@/actions/ai-feedback";
import { toast } from "sonner";

type ResultProps = {
  questions: any[];
  answers: any[]; // Mảng answers từ bảng Submission
};

export function QuizResult({ questions, answers }: ResultProps) {
  
  const getAnswer = (qId: string) => answers.find((a) => a.questionId === qId);

  return (
    <div className="space-y-6 pb-20">
      {questions.map((q, idx) => {
        const userAnswer = getAnswer(q.id);
        // Logic xác định đúng sai:
        // - Trắc nghiệm: Dựa vào isCorrect trong DB
        // - Tự luận: Mặc định là null (Chờ chấm), coi như trung lập
        const isCorrect = userAnswer?.isCorrect;
        const isEssay = q.type === "ESSAY";
        
        // Màu viền: Xanh (Đúng), Đỏ (Sai), Vàng (Tự luận/Chờ)
        let borderColor = "border-l-gray-300";
        if (isEssay) borderColor = "border-l-yellow-500";
        else if (isCorrect === true) borderColor = "border-l-green-500";
        else if (isCorrect === false) borderColor = "border-l-red-500";

        return (
          <Card key={q.id} className={`border-l-4 ${borderColor} shadow-sm`}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex gap-3">
                    <Badge variant="outline" className="h-fit">Q{idx + 1}</Badge>
                    <div>
                        <p className="font-medium text-lg">{q.text}</p>
                        
                        {/* Hiển thị Media nếu có */}
                        {q.mediaUrl && q.mediaType === "AUDIO" && (
                            <div className="mt-2 flex items-center gap-2 bg-muted/30 p-2 rounded-md w-fit">
                                <Mic className="w-4 h-4 text-primary" />
                                <audio controls src={q.mediaUrl} className="h-8 w-60" />
                            </div>
                        )}
                        {q.mediaUrl && q.mediaType === "IMAGE" && (
                            <img src={q.mediaUrl} alt="Question" className="mt-2 max-h-40 rounded-md border" />
                        )}
                    </div>
                </div>

                {/* Badge Trạng thái */}
                {isEssay ? (
                    <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending Grading</Badge>
                ) : isCorrect ? (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100"><CheckCircle className="w-3 h-3 mr-1"/> Correct</Badge>
                ) : (
                    <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1"/> Incorrect</Badge>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Hiển thị đáp án trắc nghiệm */}
              {q.type === "MULTIPLE_CHOICE" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {q.options.map((opt: string, i: number) => {
                        const optLabel = String.fromCharCode(65 + i);
                        const isSelected = userAnswer?.value === optLabel;
                        const isKey = q.correctAnswer === optLabel;

                        let styleClass = "border bg-background opacity-70";
                        // Tô màu đáp án đúng
                        if (isKey) styleClass = "border-green-500 bg-green-50 text-green-700 font-bold ring-1 ring-green-500";
                        // Tô màu đáp án sai mà học sinh chọn
                        else if (isSelected && !isCorrect) styleClass = "border-red-500 bg-red-50 text-red-700 font-bold";
                        // Tô màu đáp án học sinh chọn (nếu đúng)
                        else if (isSelected && isCorrect) styleClass = "border-green-500 bg-green-50 text-green-700 font-bold";

                        return (
                            <div key={i} className={`p-3 rounded-lg flex items-center gap-2 ${styleClass}`}>
                                <span className="w-6 h-6 rounded-full border flex items-center justify-center text-xs">{optLabel}</span>
                                {opt}
                            </div>
                        );
                    })}
                  </div>
              )}

              {/* Hiển thị bài làm tự luận */}
              {q.type === "ESSAY" && (
                  <div className="p-4 bg-muted/30 rounded-md italic text-muted-foreground">
                      Your answer: "{userAnswer?.value}"
                  </div>
              )}

              {/* ✨ NÚT AI EXPLAIN (Chỉ hiện khi Sai & Là Trắc nghiệm)
              {!isCorrect && !isEssay && userAnswer && (
                  <AiExplanationBlock 
                    answerId={userAnswer.id} 
                    initialFeedback={userAnswer.feedback} 
                  />
              )} */}
                {/* HIỂN THỊ FEEDBACK CỦA GIÁO VIÊN (QUAN TRỌNG) */}
                {userAnswer?.feedback && (
                    <div className="mt-4 p-4 bg-yellow-50/80 border border-yellow-200 rounded-lg text-yellow-900">
                        <div className="flex items-center gap-2 font-bold text-sm mb-1">
                            <span>👩‍🏫 Teacher's Feedback:</span>
                        </div>
                        <p className="whitespace-pre-wrap text-sm">{userAnswer.feedback}</p>
                    </div>
                )}

                {/* Nút AI Explain (Giữ nguyên hoặc ẩn đi nếu đã có feedback giáo viên) */}
                {!isCorrect && !userAnswer?.feedback && userAnswer && (
                    <AiExplanationBlock answerId={userAnswer.id} initialFeedback={userAnswer.aiFeedback} />
                )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// --- COMPONENT CON: Nút bấm & Hộp thoại AI ---
function AiExplanationBlock({ answerId, initialFeedback }: { answerId: string, initialFeedback: string | null }) {
    const [feedback, setFeedback] = useState(initialFeedback);
    const [loading, setLoading] = useState(false);

    const handleAskAi = async () => {
        setLoading(true);
        const res = await generateAiFeedback(answerId);
        setLoading(false);
        
        if (res.success) {
            setFeedback(res.feedback);
        } else {
            toast.error("AI is busy. Try again later.");
        }
    };

    if (feedback) {
        return (
            <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg text-sm text-purple-900 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-2 font-bold mb-1 text-purple-700">
                    <Sparkles className="w-4 h-4" /> AI Explanation:
                </div>
                <p className="leading-relaxed whitespace-pre-wrap">{feedback}</p>
            </div>
        );
    }

    return (
        <div className="mt-2">
            <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleAskAi} 
                disabled={loading}
                className="text-purple-600 hover:text-purple-800 hover:bg-purple-50 gap-2 border border-purple-100 shadow-sm"
            >
                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                Why is my answer wrong?
            </Button>
        </div>
    );
}