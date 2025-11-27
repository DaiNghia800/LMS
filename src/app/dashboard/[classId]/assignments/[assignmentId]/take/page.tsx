import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
// 👇 Import icon còn thiếu
import { ArrowLeft, CheckCircle } from "lucide-react";

// 👇 Đảm bảo đường dẫn import đúng
import { QuizForm } from "@/components/quiz-form";
import { QuizResult } from "@/components/quiz-result";

interface Props {
  params: Promise<{ classId: string; assignmentId: string }>;
}

export default async function TakeQuizPage({ params }: Props) {
  const session = await auth();
  if (!session) redirect("/");

  const { classId, assignmentId } = await params;
  const currentUserId = (session.user as any).id;

  // 1. Lấy đề bài, câu hỏi VÀ bài nộp của học sinh (nếu có)
  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: {
      questions: {
        orderBy: { createdAt: "asc" }, // Sắp xếp câu hỏi
      },
      submissions: {
        where: { studentId: currentUserId },
        include: {
            answers: true // 👇 QUAN TRỌNG: Lấy chi tiết câu trả lời để hiện kết quả
        }
      }
    },
  });

  if (!assignment) return <div className="p-10 text-center">Assignment not found</div>;

  // Kiểm tra xem đã nộp bài chưa
  const submission = assignment.submissions[0];
  const isSubmitted = !!submission;
  const score = submission?.grade !== null ? submission?.grade : "Pending";

  return (
    <div className="min-h-screen bg-background xs:p-4 md:p-8 transition-colors duration-300">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* HEADER: Nút quay lại */}
        <div className="flex items-center gap-2">
            <Link href={`/dashboard/${classId}`}>
                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-primary">
                    <ArrowLeft className="w-4 h-4" /> Back to Class
                </Button>
            </Link>
        </div>

        {/* NỘI DUNG CHÍNH */}
        {isSubmitted ? (
            /* --- TRƯỜNG HỢP 1: ĐÃ NỘP BÀI -> HIỆN KẾT QUẢ --- */
            <div className="space-y-8">
                {/* Card Tổng kết điểm */}
                <div className="bg-card p-8 rounded-xl border shadow-sm text-center space-y-4 animate-in fade-in zoom-in duration-500 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/40 to-primary"></div>
                    
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-2 shadow-inner">
                        <CheckCircle className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-bold text-foreground">Assignment Completed!</h1>
                    
                    <div className="py-4">
                        <span className="text-7xl font-black text-primary tracking-tighter">
                            {score}
                        </span>
                        <span className="text-3xl text-muted-foreground font-normal">/10</span>
                    </div>
                    
                    {/* Hiển thị lời phê của giáo viên (nếu có) */}
                    {submission.feedback && (
                        <div className="bg-muted/30 p-4 rounded-lg border text-left max-w-xl mx-auto">
                            <p className="text-xs font-bold text-primary uppercase mb-1">Teacher's Comment:</p>
                            <p className="text-foreground italic">"{submission.feedback}"</p>
                        </div>
                    )}

                    <p className="text-muted-foreground max-w-md mx-auto text-sm mt-4">
                        Review your answers below. <br></br> Click on <span className="text-purple-600 font-bold">"Why is my answer wrong?"</span> to ask AI.
                    </p>
                </div>

                {/* Chi tiết từng câu */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-foreground">Detailed Review</h2>
                    <QuizResult 
                        questions={assignment.questions} 
                        answers={submission.answers} 
                    />
                </div>
            </div>
        ) : (
            /* --- TRƯỜNG HỢP 2: CHƯA NỘP -> HIỆN FORM LÀM BÀI --- */
            <div className="space-y-8">
                <div className="bg-card p-6 rounded-xl border shadow-sm">
                    <h1 className="text-3xl font-bold text-primary">{assignment.title}</h1>
                    {assignment.content && <p className="text-muted-foreground mt-2">{assignment.content}</p>}
                    
                    <div className="mt-4 flex gap-3">
                        <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium border border-primary/20">
                            {assignment.questions.length} Questions
                        </span>
                        {assignment.dueDate && (
                            <span className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-sm border">
                                Due: {new Date(assignment.dueDate).toLocaleDateString()}
                            </span>
                        )}
                    </div>
                </div>

                {/* Form làm bài */}
                <QuizForm 
                    assignmentId={assignmentId} 
                    classId={classId}
                    questions={assignment.questions as any} 
                />
            </div>
        )}
        
      </div>
    </div>
  );
}