import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { CreateAssignmentForm } from "@/components/create-assignment-form";
import { SubmitAssignmentForm } from "@/components/submit-assignment-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge"; 

interface ClassDetailPageProps {
  params: Promise<{
    classId: string;
  }>;
}

export default async function ClassDetailPage({ params }: ClassDetailPageProps) {
  const session = await auth();
  if (!session) redirect("/");

  const { classId } = await params;

  const classDetail = await prisma.class.findUnique({
    where: { id: classId },
    include: {
      teacher: true,
      assignments: {
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
              select: { questions: true } 
          }
        }
      },
      _count: {
        select: { members: true },
      },
    },
  });

  if (!classDetail) return <div className="p-8">Class not found.</div>;

  const isTeacher = classDetail.teacherId === (session.user as any).id;

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                {classDetail.name}
              </h1>
              <p className="text-muted-foreground text-lg mb-4">
                {classDetail.description}
              </p>
              <div className="flex items-center gap-3 text-sm">
                <Badge variant="secondary" className="px-3 py-1">
                  Teacher: {classDetail.teacher.name}
                </Badge>
                <Badge variant="outline" className="px-3 py-1 font-mono">
                  Code: {classDetail.inviteCode}
                </Badge>
                <span className="text-muted-foreground">
                  {classDetail._count.members} Students
                </span>
              </div>
            </div>
            
            {/* If Teacher, show Create Assignment Button */}
            {isTeacher && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button>+ New Assignment</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Assignment</DialogTitle>
                    <DialogDescription>
                      Add a new task for your students.
                    </DialogDescription>
                  </DialogHeader>
                  <CreateAssignmentForm classId={classId} />
                </DialogContent>
              </Dialog>
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
            classDetail.assignments.map((assignment) => (
              <Card key={assignment.id} className="hover:shadow-md transition bg-card">
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

                  {/* 2. File đính kèm (nếu có) */}
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
                      /* GIAO DIỆN GIÁO VIÊN (2 Nút riêng biệt) */
                      <>
                        {/* Nút 1: Soạn câu hỏi */}
                        <Button asChild variant="outline" size="sm" className="border-primary text-primary hover:bg-primary/10">
                          <Link href={`/dashboard/${classId}/assignments/${assignment.id}?tab=questions`}>
                            Edit Questions ✏️
                          </Link>
                        </Button>

                        {/* Nút 2: Chấm bài */}
                        <Button asChild variant="outline" size="sm" className="border-primary text-primary hover:bg-primary/10">
                          <Link href={`/dashboard/${classId}/assignments/${assignment.id}?tab=submissions`}>
                            View Submissions 📝
                          </Link>
                        </Button>
                      </>
                    ) : (
                        /* GIAO DIỆN HỌC SINH */
                        <>
                            {/* Trường hợp A: Bài tập TRẮC NGHIỆM/TỰ LUẬN (Quiz) */}
                            {assignment._count.questions > 0 ? (
                                <Button asChild size="sm" className="bg-primary text-primary-foreground hover:opacity-90">
                                    <Link href={`/dashboard/${classId}/assignments/${assignment.id}/take`}>
                                        Start Quiz 📝
                                    </Link>
                                </Button>
                            ) : (
                                /* Trường hợp B: Bài tập NỘP FILE (Essay Submission) */
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button size="sm" className="bg-primary text-primary-foreground hover:opacity-90">
                                            Submit Work 📤
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Submit Assignment</DialogTitle>
                                            <DialogDescription>{assignment.title}</DialogDescription>
                                        </DialogHeader>
                                        <SubmitAssignmentForm 
                                            assignmentId={assignment.id} 
                                            // Note: Cần sửa query ở trên để lấy submissions[0] thì mới có defaultNote
                                        />
                                    </DialogContent>
                                </Dialog>
                            )}
                        </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

      </div>
    </div>
  );
}