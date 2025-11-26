import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreateAssignmentButton } from "@/components/create-assignment-button";
import { SubmitAssignmentForm } from "@/components/submit-assignment-form";
import { BackButton } from "@/components/back-button";
interface ClassDetailPageProps {
  params: Promise<{
    classId: string;
  }>;
}

export default async function ClassDetailPage({ params }: ClassDetailPageProps) {
  const session = await auth();
  if (!session) redirect("/");

  const { classId } = await params;
  const currentUserId = (session.user as any).id;

  const classDetail = await prisma.class.findUnique({
    where: { id: classId },
    include: {
      teacher: true,
      assignments: {
        orderBy: { createdAt: "desc" },
        // 👇 QUAN TRỌNG: Lấy thêm thông tin để phân loại bài tập và trạng thái nộp
        include: {
            _count: {
                select: { questions: true } 
            },
            submissions: {
                where: { studentId: currentUserId },
                take: 1
            }
        }
      },
      _count: {
        select: { members: true },
      },
    },
  });

  if (!classDetail) return <div className="p-8">Class not found.</div>;

  const isTeacher = classDetail.teacherId === currentUserId;

  return (
    <div className="min-h-screen bg-background xs:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="mb-2">
          <BackButton href="/dashboard" label="Back to Dashboard" />
        </div>

        {/* HEADER */}
        <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
          <div className="flex xs:flex-nowrap flex-wrap xs:justify-between xs:items-start justify-center items-center xs:text-left text-center">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                {classDetail.name}
              </h1>
              <p className="text-muted-foreground text-lg mb-4">
                {classDetail.description}
              </p>
              <div className="xs:flex items-center text-center gap-3 text-sm">
                <Badge variant="secondary" className="px-3 py-1 xs:mt-0 mt-2">
                  Teacher: {classDetail.teacher.name}
                </Badge>
                <Badge variant="outline" className="px-3 py-1 font-mono xs:mt-0 mt-2 flex w-full xs:w-auto">
                  Code: {classDetail.inviteCode}
                </Badge>
                <span className="text-muted-foreground xs:mt-0 mt-2 xs:inline-flex block">
                  {classDetail._count.members} Students
                </span>
              </div>
            </div>
            
            {/* If Teacher, show Create Assignment Button */}
            {isTeacher && (
               <CreateAssignmentButton classId={classId} />
            )}
          </div>
        </div>

        {/* ASSIGNMENTS LIST */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Assignments</h2>
          {classDetail.assignments.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-border rounded-xl">
              <p className="text-muted-foreground">No assignments posted yet.</p>
            </div>
          ) : (
            classDetail.assignments.map((assignment) => {
              // Kiểm tra xem học sinh đã nộp bài chưa
              const mySubmission = assignment.submissions[0];
              const isSubmitted = !!mySubmission;
              
              return (
                <Card key={assignment.id} className="hover:shadow-md transition bg-card border-border">
                    <CardHeader>
                    <div className="flex justify-between items-start">
                        <CardTitle className="text-xl text-primary">
                        {assignment.title}
                        </CardTitle>
                        {assignment.dueDate && (
                        <Badge variant={new Date(assignment.dueDate) < new Date() ? "destructive" : "outline"}>
                            Due: {format(new Date(assignment.dueDate), "PPP")}
                        </Badge>
                        )}
                    </div>
                    </CardHeader>
                    
                    <CardContent>
                    {/* 1. Nội dung bài tập */}
                    <p className="text-muted-foreground line-clamp-2 mb-4">
                        {assignment.content || "No instructions provided."}
                    </p>

                    {/* 2. File đính kèm (nếu giáo viên có up) */}
                    {assignment.fileUrl && (
                        <a 
                            href={assignment.fileUrl} 
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-primary hover:underline mb-4 bg-muted/30 p-2 rounded border border-border w-fit"
                        >
                            📄 Attached File (Click to open)
                        </a>
                    )}

                    {/* 3. KHU VỰC NÚT BẤM (QUAN TRỌNG) */}
                    <div className="flex justify-end gap-2 pt-2">
                        {isTeacher ? (
                        /* --- GIAO DIỆN GIÁO VIÊN --- */
                        <>
                            <Button asChild variant="outline" size="sm" className="border-primary text-primary hover:bg-primary/10">
                                <Link href={`/dashboard/${classId}/assignments/${assignment.id}?tab=questions`}>
                                    Edit Questions ✏️
                                </Link>
                            </Button>
                            <Button asChild variant="secondary" size="sm" className="bg-secondary text-secondary-foreground hover:bg-secondary/80">
                                <Link href={`/dashboard/${classId}/assignments/${assignment.id}?tab=submissions`}>
                                    View Submissions 📝
                                </Link>
                            </Button>
                        </>
                        ) : (
                        /* --- GIAO DIỆN HỌC SINH --- */
                        <>
                            {/* Trường hợp A: Bài tập TRẮC NGHIỆM/TỰ LUẬN (Quiz) */}
                            {assignment._count.questions > 0 ? (
                                <Button 
                                    asChild 
                                    size="sm" 
                                    className={isSubmitted ? "bg-green-600 hover:bg-green-700 text-white" : "bg-primary text-primary-foreground hover:opacity-90"}
                                >
                                    <Link href={`/dashboard/${classId}/assignments/${assignment.id}/take`}>
                                        {isSubmitted ? "View Result" : "Start Quiz 📝"}
                                    </Link>
                                </Button>
                            ) : (
                                /* Trường hợp B: Bài tập NỘP FILE (Essay Submission) */
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button 
                                            size="sm" 
                                            className={isSubmitted ? "bg-green-600 hover:bg-green-700 text-white" : "bg-primary text-primary-foreground hover:opacity-90"}
                                        >
                                            {isSubmitted ? "Edit Submission" : "Submit Work 📤"}
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Submit Assignment</DialogTitle>
                                            <DialogDescription>{assignment.title}</DialogDescription>
                                        </DialogHeader>
                                        
                                        <SubmitAssignmentForm 
                                            assignmentId={assignment.id} 
                                            defaultNote={mySubmission?.textResponse || ""}
                                        />
                                    </DialogContent>
                                </Dialog>
                            )}
                        </>
                        )}
                    </div>
                    </CardContent>
                </Card>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}