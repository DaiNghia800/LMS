import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Loader2, FileText, Download, FileAudio, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import React from "react";

// 👇 IMPORT QUAN TRỌNG
import { QuizGraderView } from "@/components/quiz-grader-view"; // Dùng lại cái này để hiện A,B,C,D
import { GraderForm } from "@/components/grader-form"; // Form nhập điểm bên phải

interface Props {
  params: Promise<{ classId: string; assignmentId: string; submissionId: string }>;
}

export default async function SubmissionGraderPage({ params }: Props) {
  const session = await auth();
  if (!session) redirect("/");

  const { classId, assignmentId, submissionId } = await params;

  // 1. Fetch dữ liệu chi tiết
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: {
      student: true,
      answers: true, // Lấy câu trả lời
      assignment: {
        include: {
          class: true,
          questions: { orderBy: { createdAt: "asc" } } // Lấy câu hỏi
        },
      },
    },
  });

  if (!submission) return <div className="p-8 text-center">Submission not found.</div>;

  // Kiểm tra quyền giáo viên
  if (submission.assignment.class.teacherId !== (session.user as any)?.id) {
    return <div className="p-8 text-red-500">Unauthorized access.</div>;
  }

  // Phân loại
  const isQuiz = submission.answers.length > 0;
  const isFile = !!submission.fileUrl;
  
  const fileExt = submission.fileUrl?.split('.').pop()?.toLowerCase();
  const isPDF = fileExt === 'pdf';
  const isAudio = ['mp3', 'wav', 'ogg'].includes(fileExt || '');

  // 👇 LOGIC TÍNH ĐIỂM BAN ĐẦU (Auto-Calculate)
  // Nếu trong DB đã có điểm (grade !== null) -> Dùng điểm đó.
  // Nếu chưa có điểm (null) -> Tính tổng điểm các câu trắc nghiệm đúng để gợi ý cho GV.
  let suggestedGrade = submission.grade;
  
  if (suggestedGrade === null && isQuiz) {
      const totalQuestions = submission.assignment.questions.length;
      const correctAnswers = submission.answers.filter(a => a.isCorrect === true).length;
      if (totalQuestions > 0) {
          // Tính quy đổi ra thang điểm 10 (Lấy 1 chữ số thập phân)
          suggestedGrade = Math.round((correctAnswers / totalQuestions) * 10 * 10) / 10;
      }
  }

  return (
    <div className="min-h-screen bg-background p-0 xs:p-4 md:p-8">
      <div className="max-w-[1600px] mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b">
            <div className="flex items-center gap-4">
                <Link href={`/dashboard/${classId}/assignments/${assignmentId}?tab=submissions`}>
                    <Button variant="outline" size="icon"><ArrowLeft className="w-4 h-4"/></Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                        {submission.student.name}'s Submission
                        <Badge variant={submission.grade !== null ? "default" : "secondary"}>
                            {submission.grade !== null ? `Official Grade: ${submission.grade}` : "Pending Review"}
                        </Badge>
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Submitted: {format(submission.submittedAt, "PPP p")}
                    </p>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* --- CỘT TRÁI: NỘI DUNG BÀI LÀM (Chiếm 8 phần) --- */}
            <div className="lg:col-span-8 space-y-8">
                
                {/* 👇 SỬ DỤNG QUIZ GRADER VIEW 
                    Component này sẽ hiển thị đầy đủ câu hỏi, Audio, Ảnh, và 4 đáp án A,B,C,D
                    được tô màu Xanh/Đỏ y hệt như lúc học sinh xem kết quả.
                */}
                {isQuiz && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary"/> Quiz & Essay Responses
                        </h2>
                        
                        <QuizGraderView 
                            questions={submission.assignment.questions as any} 
                            answers={submission.answers}
                            isTeacher={true}
                        />
                    </div>
                )}

                {/* NẾU LÀ FILE (PDF/Audio) */}
                {isFile && (
                    <Card className="h-[80vh] flex flex-col">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                {isAudio ? <FileAudio/> : <FileText/>} Attached File
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 p-0 overflow-hidden bg-muted/20 relative">
                            {isPDF ? (
                                <iframe src={submission.fileUrl!} className="w-full h-full border-none" />
                            ) : isAudio ? (
                                <div className="flex items-center justify-center h-full">
                                    <audio controls src={submission.fileUrl!} className="w-full max-w-md" />
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full gap-4">
                                    <p className="text-muted-foreground">Preview not available.</p>
                                    <Button asChild>
                                        <a href={submission.fileUrl!} target="_blank" download>
                                            <Download className="mr-2 w-4 h-4"/> Download File
                                        </a>
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
                
                {/* LỜI NHẮN CỦA HỌC SINH */}
                {submission.textResponse && (
                    <Card>
                        <CardHeader><CardTitle className="text-base">Student Note</CardTitle></CardHeader>
                        <CardContent>
                            <p className="italic text-muted-foreground">{submission.textResponse}</p>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* --- CỘT PHẢI: FORM CHẤM ĐIỂM (Chiếm 4 phần - Sticky) --- */}
            <div className="lg:col-span-4">
                <div className="sticky top-8 space-y-6">
                    <Card className="border-primary/20 shadow-lg">
                        <CardHeader className="bg-primary/5 border-b border-primary/10">
                            <CardTitle>Grading Panel</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {/* 👇 TRUYỀN ĐIỂM GỢI Ý VÀO ĐÂY
                                Nếu chưa chấm, nó sẽ hiện điểm trắc nghiệm (VD: 5).
                                Giáo viên thấy bài luận hay có thể sửa thành 8 rồi bấm Save.
                            */}
                            <GraderForm 
                                submissionId={submission.id}
                                initialGrade={suggestedGrade} 
                                initialFeedback={submission.feedback}
                            />
                        </CardContent>
                    </Card>

                    {isQuiz && (
                        <div className="text-xs text-muted-foreground text-center p-4 bg-muted/50 rounded-lg">
                            <p>💡 <strong>Tip:</strong> The grade above is auto-calculated from multiple choice questions. Please review essay answers and update the final score manually.</p>
                        </div>
                    )}
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}