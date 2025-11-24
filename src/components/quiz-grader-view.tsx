"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertCircle, Mic } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { generateAiFeedback } from "@/actions/ai-feedback";
import { toast } from "sonner";
import { Sparkles, Loader2 } from "lucide-react";

// 👇 IMPORT COMPONENT CHẤM BÀI WRITING
import { EssayGrader } from "@/components/essay-grader";

interface Props {
  questions: any[];
  answers: any[];
  isTeacher?: boolean; // Biến để biết ai đang xem
}

export function QuizGraderView({ questions, answers, isTeacher = false }: Props) {
  
  const getAnswer = (qId: string) => answers.find((a) => a.questionId === qId);

  return (
    <div className="space-y-6">
      {questions.map((q, idx) => {
        const userAnswer = getAnswer(q.id);
        const isCorrect = userAnswer?.isCorrect;
        const isEssay = q.type === "ESSAY";

        // Màu viền thẻ
        let borderColor = "border-l-gray-300";
        if (isEssay) borderColor = "border-l-yellow-500"; // Màu vàng cho bài luận (chờ chấm)
        else if (isCorrect) borderColor = "border-l-green-500"; 
        else borderColor = "border-l-red-500";

        return (
          <Card key={q.id} className={`border-l-4 ${borderColor} shadow-sm`}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex gap-2">
                    <Badge variant="outline">Q{idx + 1}</Badge>
                    <div className="space-y-2 w-full">
                        <p className="font-medium">{q.text}</p>
                        
                        {/* Hiển thị Media (Audio/Ảnh) */}
                        {q.mediaUrl && q.mediaType === "AUDIO" && (
                            <div className="flex items-center gap-2 bg-muted/30 p-2 rounded-md w-fit border">
                                <Mic className="w-4 h-4 text-primary" />
                                <audio controls src={q.mediaUrl} className="h-8 w-60" />
                            </div>
                        )}
                        {q.mediaUrl && q.mediaType === "IMAGE" && (
                            <img src={q.mediaUrl} alt="Question" className="max-h-48 rounded-md border" />
                        )}
                    </div>
                </div>
                
                {/* Badge Trạng thái */}
                {isEssay ? (
                    <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200 shrink-0">
                        <AlertCircle className="w-3 h-3 mr-1"/> {isTeacher ? "Needs Grading" : "Pending Review"}
                    </Badge>
                ) : isCorrect ? (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 shrink-0">
                        <CheckCircle className="w-3 h-3 mr-1"/> Correct
                    </Badge>
                ) : (
                    <Badge variant="destructive" className="shrink-0">
                        <XCircle className="w-3 h-3 mr-1"/> Incorrect
                    </Badge>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3 pt-0">
                
                {/* === PHẦN HIỂN THỊ BÀI LÀM === */}

                {/* 1. TRẮC NGHIỆM */}
                {q.type === "MULTIPLE_CHOICE" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                        {q.options.map((opt: string, i: number) => {
                            const char = String.fromCharCode(65 + i);
                            const isSelected = userAnswer?.value === char;
                            const isKey = q.correctAnswer === char;

                            let bgClass = "bg-background border";
                            if (isKey) bgClass = "bg-green-50 border-green-500 text-green-700 font-bold"; 
                            else if (isSelected && !isCorrect) bgClass = "bg-red-50 border-red-500 text-red-700"; 

                            return (
                                <div key={i} className={`p-3 rounded-md text-sm flex items-center gap-2 ${bgClass}`}>
                                    {isSelected && (isCorrect ? <CheckCircle className="w-4 h-4"/> : <XCircle className="w-4 h-4"/>)}
                                    <span className="w-6 h-6 rounded-full border flex items-center justify-center text-xs bg-white">{char}</span>
                                    {opt}
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* 2. TỰ LUẬN (WRITING) */}
                {q.type === "ESSAY" && (
                    <div className="mt-2 space-y-4">
                        <div className="p-4 bg-muted/30 rounded-md border text-foreground italic whitespace-pre-wrap">
                            {userAnswer?.value || <span className="text-muted-foreground">No answer provided.</span>}
                        </div>

                        {/* --- KHU VỰC CHẤM BÀI (QUAN TRỌNG) --- */}
                        
                        {/* A. Nếu là GIÁO VIÊN -> Hiện công cụ chấm AI + Sửa */}
                        {isTeacher && userAnswer && (
                            <EssayGrader 
                                answerId={userAnswer.id} 
                                studentAnswer={userAnswer.value} 
                                initialFeedback={userAnswer.feedback || userAnswer.aiFeedback} // Lấy feedback cũ nếu có
                            />
                        )}

                        {/* B. Nếu là HỌC SINH -> Chỉ hiện Feedback đã chấm */}
                        {!isTeacher && (userAnswer?.feedback || userAnswer?.aiFeedback) && (
                             <div className="p-4 bg-yellow-50/80 border border-yellow-200 rounded-lg text-yellow-900 animate-in fade-in">
                                <div className="flex items-center gap-2 font-bold text-sm mb-2 text-yellow-700">
                                    <span>👩‍🏫 Teacher's Feedback:</span>
                                </div>
                                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                                    {userAnswer.feedback || userAnswer.aiFeedback}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                 {/* Nút AI Explain cho TRẮC NGHIỆM (Chỉ hiện khi sai) */}
                 {!isCorrect && !isEssay && userAnswer && (
                    <AiExplanationBlock answerId={userAnswer.id} initialFeedback={userAnswer.aiFeedback} />
                )}

            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// --- Component con: Nút giải thích trắc nghiệm (Giữ nguyên) ---
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
            toast.error("AI is busy.");
        }
    };

    if (feedback) {
        return (
            <div className="mt-2 p-3 bg-purple-50 border border-purple-200 rounded-lg text-sm text-purple-900 animate-in fade-in">
                <div className="flex items-center gap-2 font-bold mb-1 text-purple-700"><Sparkles className="w-3 h-3" /> AI Explanation:</div>
                <p>{feedback}</p>
            </div>
        );
    }

    return (
        <div className="mt-2">
             <Button variant="ghost" size="sm" onClick={handleAskAi} disabled={loading} className="text-purple-600 hover:text-purple-800 h-8 gap-2 text-xs border border-purple-100">
                {loading ? <Loader2 className="w-3 h-3 animate-spin"/> : <Sparkles className="w-3 h-3"/>} Why is this wrong?
            </Button>
        </div>
    )
}