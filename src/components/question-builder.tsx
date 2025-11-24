"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, Save, Mic, X, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { AIImportButton } from "@/components/ai-import-button"; 
import { saveQuestions } from "@/actions/question"; 
import { UploadButton } from "@/lib/uploadthing"; 

// --- 1. TYPES ---
type QuestionType = "MULTIPLE_CHOICE" | "ESSAY";

type QuestionItem = {
  id: string; 
  text: string;
  type: QuestionType;
  options: string[]; 
  correctAnswer: string; 
  mediaUrl?: string;
  mediaType?: "AUDIO" | "IMAGE" | "NONE";
  points?: number;
};

interface QuestionBuilderProps {
  assignmentId: string;
  initialQuestions: QuestionItem[];
}

// --- 2. MAIN COMPONENT ---
export function QuestionBuilder({ assignmentId, initialQuestions }: QuestionBuilderProps) {
  const [questions, setQuestions] = useState<QuestionItem[]>(initialQuestions);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Đồng bộ dữ liệu khi mới vào trang
  useEffect(() => {
    setQuestions(initialQuestions);
  }, [initialQuestions]);

  // --- LOGIC FUNCTIONS ---
  const addManualQuestion = (type: QuestionType) => {
    setQuestions([
      ...questions,
      {
        id: Math.random().toString(),
        text: "",
        type,
        options: type === "MULTIPLE_CHOICE" ? ["", "", "", ""] : [], 
        correctAnswer: "",
        mediaType: "NONE",
        points: 1
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    const newQ = [...questions];
    newQ.splice(index, 1);
    setQuestions(newQ);
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const newQ = [...questions];
    (newQ[index] as any)[field] = value;
    setQuestions(newQ);
  };

  const updateOption = (qIndex: number, optIndex: number, value: string) => {
    const newQ = [...questions];
    newQ[qIndex].options[optIndex] = value;
    setQuestions(newQ);
  };

  const handleAIImport = (aiQuestions: any[]) => {
    const formatted = aiQuestions.map((q: any) => ({
      ...q,
      id: Math.random().toString(), 
      options: q.options || ["", "", "", ""], 
      correctAnswer: q.correctAnswer || "",
      mediaType: "NONE",
      points: 1
    }));
    setQuestions([...questions, ...formatted]);
  };

  const handleSave = async () => {
    setLoading(true);
    // Lọc bỏ câu hỏi rỗng
    const filteredQuestions = questions.filter(q => q.text && q.text.trim().length > 0);
    
    const res = await saveQuestions(assignmentId, filteredQuestions);
    setLoading(false);

    if (res.error) {
        toast.error(`Save Failed: ${res.error}`);
    } else {
        toast.success("Questions saved successfully!");
        router.refresh(); 
    }
  };

  // --- RENDER ---
  return (
    <div className="space-y-6 pb-24">
        
        {/* DANH SÁCH CÂU HỎI */}
        <div className="space-y-6">
            {questions.length === 0 && (
                <div className="text-center py-20 border-2 border-dashed border-primary/20 rounded-xl bg-primary/5 text-muted-foreground">
                    <p className="text-lg font-medium mb-2">No questions yet.</p>
                    <p className="text-sm">Click buttons below or use AI to generate.</p>
                </div>
            )}

            {questions.map((q, idx) => (
                <Card key={q.id} className="relative group border-l-4 border-l-primary shadow-sm hover:shadow-md transition-all">
                    <Button 
                        variant="destructive" size="icon" 
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition h-8 w-8"
                        onClick={() => removeQuestion(idx)}
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>

                    <CardHeader className="pb-2 flex-row items-center justify-between">
                        <div className="flex items-center gap-3">
                             <Badge variant="secondary" className="font-mono text-sm px-2">Q{idx + 1}</Badge>
                             <Badge className="bg-primary/10 text-primary hover:bg-primary/20">{q.type === "MULTIPLE_CHOICE" ? "Multiple Choice" : "Essay"}</Badge>
                        </div>
                        {/* Input điểm số */}
                        <div className="flex items-center gap-2 mr-12">
                            <Label className="text-xs text-muted-foreground">Points:</Label>
                            <Input 
                                type="number" 
                                value={q.points || 1}
                                onChange={(e) => updateQuestion(idx, "points", parseInt(e.target.value) || 1)}
                                className="w-16 h-8 text-center"
                            />
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold uppercase text-muted-foreground">Question Content</Label>
                            <Textarea 
                                placeholder="Enter your question here..." 
                                value={q.text}
                                onChange={(e) => updateQuestion(idx, "text", e.target.value)}
                                className="text-lg font-medium min-h-[80px] border-primary/20 focus-visible:ring-primary"
                            />
                        </div>

                        {/* === KHU VỰC MEDIA (ĐÃ CHỈNH MÀU) === */}
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-muted-foreground">Media Attachment</Label>
                            
                            {!q.mediaUrl ? (
                                <div className="w-fit relative group">
                                    <UploadButton
                                        endpoint="classAttachment"
                                        appearance={{
                                            container: "w-auto flex-row p-0 m-0",
                                            button: "bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 text-sm font-medium rounded-md shadow-sm transition-all flex items-center gap-2 after:bg-primary/50",
                                            allowedContent: "hidden"
                                        }}
                                        content={{
                                            button: <><Mic className="w-4 h-4" /> <span>Attach Media</span></>
                                        }}
                                        onClientUploadComplete={(res) => {
                                            if (res && res[0]) {
                                                const fileUrl = res[0].url;
                                                const fileName = res[0].name;
                                                const ext = fileName.split('.').pop()?.toLowerCase();
                                                let type: "AUDIO" | "IMAGE" | "NONE" = "NONE";

                                                if (['mp3', 'wav', 'ogg', 'm4a'].includes(ext || '')) type = "AUDIO";
                                                else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) type = "IMAGE";

                                                updateQuestion(idx, "mediaUrl", fileUrl);
                                                updateQuestion(idx, "mediaType", type);
                                                toast.success("Media attached!");
                                            }
                                        }}
                                        onUploadError={(error: any) => {
                                            toast.error(error.message);
                                        }}
                                    />
                                </div>
                            ) : (
                                <div className="flex items-center gap-4 p-3 border border-primary/30 rounded-lg bg-primary/5 relative group w-fit pr-12 transition-all hover:border-primary/50">
                                    {q.mediaType === "AUDIO" && (
                                        <div className="flex items-center gap-3">
                                            <div className="bg-primary text-primary-foreground p-2 rounded-full"><Mic className="w-4 h-4" /></div>
                                            <audio controls src={q.mediaUrl} className="h-8 w-64 accent-primary" />
                                        </div>
                                    )}
                                    {q.mediaType === "IMAGE" && (
                                        <div className="relative">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={q.mediaUrl} alt="Question" className="h-32 w-auto rounded-md border shadow-sm object-contain bg-white" />
                                        </div>
                                    )}
                                    
                                    <Button
                                        variant="ghost" size="icon"
                                        className="absolute top-1 right-1 text-destructive hover:bg-destructive/10 h-6 w-6 rounded-full"
                                        onClick={() => { updateQuestion(idx, "mediaUrl", null); updateQuestion(idx, "mediaType", "NONE"); }}
                                    >
                                        <X className="w-3 h-3" />
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* === KHU VỰC ĐÁP ÁN === */}
                        {q.type === "MULTIPLE_CHOICE" && (
                            <div className="space-y-2 pt-2">
                                <Label className="text-xs font-bold uppercase text-muted-foreground">Options & Correct Answer</Label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {q.options.map((opt, optIdx) => (
                                        <div key={optIdx} className="flex items-center gap-2">
                                            <div 
                                                className={`w-10 h-10 flex items-center justify-center rounded-md border-2 cursor-pointer transition-all font-bold text-lg select-none
                                                    ${q.correctAnswer === String.fromCharCode(65 + optIdx) 
                                                        ? 'bg-primary border-primary text-primary-foreground shadow-md scale-105' 
                                                        : 'bg-card border-muted text-muted-foreground hover:border-primary/50'}`}
                                                onClick={() => updateQuestion(idx, "correctAnswer", String.fromCharCode(65 + optIdx))}
                                                title="Click to mark as correct"
                                            >
                                                {String.fromCharCode(65 + optIdx)}
                                            </div>
                                            <Input 
                                                value={opt} 
                                                onChange={(e) => updateOption(idx, optIdx, e.target.value)}
                                                placeholder={`Answer option ${optIdx + 1}`}
                                                className="border-primary/20 focus-visible:ring-primary bg-white/50"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {q.type === "ESSAY" && (
                            <div className="p-4 bg-secondary/20 rounded-lg text-sm text-primary italic border border-primary/20 flex items-center gap-2">
                                <span className="text-xl">✍️</span> Students will type a long answer here.
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>

        {/* FOOTER TOOLBAR */}
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
            <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => addManualQuestion("MULTIPLE_CHOICE")} className="border-primary text-primary hover:bg-primary/10">
                        <Plus className="w-4 h-4 mr-2" /> MCQ
                    </Button>
                    <Button variant="outline" onClick={() => addManualQuestion("ESSAY")} className="border-primary text-primary hover:bg-primary/10">
                        <Plus className="w-4 h-4 mr-2" /> Essay
                    </Button>
                    <AIImportButton onImport={handleAIImport} />
                </div>
                
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <span className="text-sm font-medium text-muted-foreground whitespace-nowrap hidden sm:inline-block">
                        {questions.length} Questions
                    </span>
                    <Button onClick={handleSave} disabled={loading} className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 shadow-md font-bold">
                        {loading ? "Saving..." : <><Save className="w-4 h-4 mr-2" /> Save All Changes</>}
                    </Button>
                </div>
            </div>
        </div>
    </div>
  );
}