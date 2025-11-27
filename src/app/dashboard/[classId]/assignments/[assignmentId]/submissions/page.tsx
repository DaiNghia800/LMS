import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"; 
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface SubmissionListPageProps {
  params: Promise<{ classId: string; assignmentId: string }>;
}

export default async function SubmissionListPage(props: SubmissionListPageProps) {
  const session = await auth();
  if (!session) redirect("/");

  const { classId, assignmentId } = await props.params;
  const currentUserId = (session.user as any)?.id;

  // 1. Lấy thông tin bài tập và danh sách bài nộp
  const assignmentData = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: {
      submissions: {
        include: {
          student: true, // Lấy tên học sinh
        },
        orderBy: { submittedAt: "asc" },
      },
      class: true,
    },
  });

  if (!assignmentData || !assignmentData.class) redirect("/dashboard");

  // 2. Bảo mật: Chỉ giáo viên của lớp mới được xem
  const isTeacher = assignmentData.class.teacherId === currentUserId;
  if (!isTeacher) redirect(`/dashboard/${classId}`); 

  // Thống kê
  const gradedCount = assignmentData.submissions.filter(s => s.grade !== null).length;

  return (
    <div className="min-h-screen bg-background p-0 xs:p-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER & BREADCRUMB */}
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
                <Link href={`/dashboard/${classId}`}>
                    <Button variant="outline" size="icon" className="h-9 w-9">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        Submissions: {assignmentData.title}
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Class: {assignmentData.class.name}
                    </p>
                </div>
            </div>
            <div className="text-right">
                <Badge variant="secondary" className="text-base px-3 py-1">
                    {assignmentData.submissions.length} Submitted
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">Graded: {gradedCount}</p>
            </div>
        </div>

        {/* SUBMISSIONS TABLE */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-primary">Student Work List</CardTitle>
          </CardHeader>
          <CardContent>
            {assignmentData.submissions.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground border border-dashed rounded-lg">
                    No students have submitted yet.
                </div>
            ) : (
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead className="w-[100px]">Status</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Submitted At</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {assignmentData.submissions.map((submission) => (
                    <TableRow key={submission.id}>
                        <TableCell>
                            <Badge variant={submission.grade !== null ? "default" : "secondary"} className={submission.grade !== null ? "bg-green-600 hover:bg-green-700" : ""}>
                                {submission.grade !== null ? "GRADED" : "PENDING"}
                            </Badge>
                        </TableCell>
                        <TableCell className="font-medium text-foreground">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                    {submission.student.name?.charAt(0) || "S"}
                                </div>
                                {submission.student.name || submission.student.email}
                            </div>
                        </TableCell>
                        <TableCell>
                            {format(new Date(submission.submittedAt), 'MMM dd, HH:mm')}
                        </TableCell>
                        <TableCell className="text-lg font-bold text-primary">
                            {submission.grade !== null ? submission.grade : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                            {/* Nút này sẽ nhảy sang trang chấm chi tiết [submissionId] */}
                            <Button variant="default" size="sm" asChild>
                                <Link href={`/dashboard/${classId}/assignments/${assignmentId}/submissions/${submission.id}`}>
                                    Grade Now 📝
                                </Link>
                            </Button> 
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}