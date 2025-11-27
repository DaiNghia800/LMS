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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; 
import { CopyButton } from "@/components/copy-button";
// Import các Component con
import { CreateAssignmentButton } from "@/components/create-assignment-button";
import { SubmitAssignmentForm } from "@/components/submit-assignment-form";
import { BackButton } from "@/components/back-button";
import { CreatePostForm } from "@/components/stream/create-post-form";
import { StreamFeed } from "@/components/stream/stream-feed";
import { ScrollToHash } from "@/components/scroll-to-hash";

interface ClassDetailPageProps {
  params: Promise<{
    classId: string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ClassDetailPage({ params, searchParams }: ClassDetailPageProps) {
  const session = await auth();
  if (!session) redirect("/");

  const { classId } = await params;
  const currentUserId = (session.user as any).id;

  // 1. FETCH DỮ LIỆU LỚP HỌC & BÀI TẬP
  const classDetail = await prisma.class.findUnique({
    where: { id: classId },
    include: {
      teacher: true,
      assignments: {
        orderBy: { createdAt: "desc" },
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

  // 2. FETCH DỮ LIỆU BẢNG TIN (STREAM)
  const posts = await prisma.post.findMany({
    where: { classId: classId },
    include: {
      author: { select: { id: true, name: true, image: true } },
      comments: {
        include: { author: { select: { name: true, image: true } } },
        orderBy: { createdAt: "asc" }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  const isTeacher = classDetail.teacherId === currentUserId;

  // 👇 Lấy tab từ URL
  const searchParamsResolved = await searchParams;
  const tab = searchParamsResolved?.tab as string | undefined;
  
  // Nếu URL có tab=stream thì active tab stream, mặc định là classwork
  const activeTab = tab === "stream" ? "stream" : "classwork";

  return (
    <div className="min-h-screen bg-background xs:p-4 md:p-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* BACK BUTTON */}
        <div className="mb-2">
          <BackButton href="/dashboard" label="Back to Dashboard" />
        </div>

        {/* HEADER LỚP HỌC */}
        <div className="bg-card border border-border rounded-xl p-8 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary/40 to-primary"></div>
          
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                {classDetail.name}
              </h1>
              <p className="text-muted-foreground text-lg mb-4">
                {classDetail.description || "No description provided."}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <Badge variant="secondary" className="px-3 py-1">
                  Teacher: {classDetail.teacher.name}
                </Badge>
                <Badge variant="outline" className="px-3 py-1 font-mono">
                  Code: <CopyButton code={classDetail.inviteCode} />
                </Badge>
                <span className="text-muted-foreground flex items-center gap-1">
                   👥 {classDetail._count.members} Students
                </span>
              </div>
            </div>
            
            {/* If Teacher, show Create Assignment Button */}
            {isTeacher && (
               <CreateAssignmentButton classId={classId} />
            )}
          </div>
        </div>

        {/* NỘI DUNG CHÍNH: TABS STREAM & CLASSWORK */}
        {/* 👇 ĐÃ THÊM key={activeTab} ĐỂ RESET TAB KHI URL ĐỔI */}
        <Tabs defaultValue={activeTab} key={activeTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="classwork">📚 Classwork</TabsTrigger>
                <TabsTrigger value="stream">📢 Stream</TabsTrigger>
            </TabsList>

            {/* TAB 1: CLASSWORK (DANH SÁCH BÀI TẬP) */}
            <TabsContent value="classwork">
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-foreground mb-4">Assignments</h2>
                    
                    {classDetail.assignments.length === 0 ? (
                        <div className="text-center py-16 border-2 border-dashed border-muted/30 rounded-xl bg-muted/5">
                            <p className="text-muted-foreground font-medium">No assignments posted yet.</p>
                            <p className="text-sm text-muted-foreground/70">Check back later!</p>
                        </div>
                    ) : (
                        classDetail.assignments.map((assignment) => {
                            const mySubmission = assignment.submissions[0];
                            const isSubmitted = !!mySubmission;
                            
                            return (
                                <Card key={assignment.id} className="hover:shadow-md transition-all bg-card border-border group">
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <CardTitle className="text-xl text-primary group-hover:text-primary/80 transition-colors">
                                                {assignment.title}
                                            </CardTitle>
                                            {assignment.dueDate && (
                                                <Badge variant={new Date(assignment.dueDate) < new Date() ? "destructive" : "outline"}>
                                                    Due: {format(new Date(assignment.dueDate), "MMM dd")}
                                                </Badge>
                                            )}
                                        </div>
                                    </CardHeader>
                                    
                                    <CardContent>
                                        <p className="text-muted-foreground line-clamp-2 mb-4 text-sm">
                                            {assignment.content || "No instructions provided."}
                                        </p>

                                        {assignment.fileUrl && (
                                            <a 
                                                href={assignment.fileUrl} 
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-xs text-primary hover:underline mb-4 bg-primary/5 p-2 rounded border border-primary/10 w-fit"
                                            >
                                                📄 Attached File
                                            </a>
                                        )}

                                        <div className="flex justify-end gap-2 pt-2 border-t border-border/50 mt-2">
                                            {isTeacher ? (
                                                <>
                                                    <Button asChild variant="outline" size="sm" className="border-primary text-primary hover:bg-primary/10 h-8">
                                                        <Link href={`/dashboard/${classId}/assignments/${assignment.id}?tab=questions`}>
                                                            Edit Questions ✏️
                                                        </Link>
                                                    </Button>
                                                    <Button asChild variant="secondary" size="sm" className="bg-secondary text-secondary-foreground hover:bg-secondary/80 h-8">
                                                        <Link href={`/dashboard/${classId}/assignments/${assignment.id}?tab=submissions`}>
                                                            View Submissions 📝
                                                        </Link>
                                                    </Button>
                                                </>
                                            ) : (
                                                <>
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
            </TabsContent>

            {/* TAB 2: STREAM (BẢNG TIN) */}
            <TabsContent value="stream" className="space-y-6 max-w-7xl">
                <ScrollToHash /> 
                <CreatePostForm classId={classId} userImage={session?.user?.image || null} />
                <StreamFeed posts={posts} classId={classId} currentUserId={currentUserId} currentUserImage={session?.user?.image || null} />
            </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}