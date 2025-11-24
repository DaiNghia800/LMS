import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AssignmentSubmissionsTabProps {
  assignmentId: string;
}

// Đây là một Server Component (Async)
export async function AssignmentSubmissionsTab({ assignmentId }: AssignmentSubmissionsTabProps) {
  
  // 1. Lấy dữ liệu bài tập và toàn bộ bài nộp
  const assignmentData = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: {
      class: true, // Cần lấy thông tin lớp để tạo link
      submissions: {
        include: {
          student: true, // Lấy tên học sinh
        },
        orderBy: { submittedAt: "asc" }, // Sắp xếp nộp trước lên đầu
      },
    },
  });

  if (!assignmentData) {
      return <div className="text-center py-10 text-muted-foreground">Assignment not found.</div>;
  }

  // Tính toán số liệu
  const gradedCount = assignmentData.submissions.filter(s => s.grade !== null).length;
  const totalSubmissions = assignmentData.submissions.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-bold text-primary">Student Submissions</CardTitle>
            <div className="text-right space-y-1">
                <Badge variant="secondary" className="text-sm px-3 py-1">
                    Total: {totalSubmissions}
                </Badge>
                <p className="text-xs text-muted-foreground font-medium">
                    Graded: {gradedCount}/{totalSubmissions}
                </p>
            </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {totalSubmissions === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-muted-foreground/20 rounded-lg bg-muted/10">
                <p className="text-muted-foreground text-lg font-medium">No submissions yet.</p>
                <p className="text-sm text-muted-foreground/70">Waiting for students to turn in their work.</p>
            </div>
        ) : (
            <div className="rounded-md border overflow-hidden">
                <Table>
                <TableHeader className="bg-muted/50">
                    <TableRow>
                    <TableHead className="w-[100px]">Status</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Submitted At</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {assignmentData.submissions.map((submission) => (
                    <TableRow key={submission.id} className="hover:bg-muted/10 transition-colors">
                        <TableCell>
                            <Badge variant={submission.grade !== null ? "default" : "secondary"} className={submission.grade !== null ? "bg-green-600 hover:bg-green-700" : ""}>
                                {submission.grade !== null ? "GRADED" : "PENDING"}
                            </Badge>
                        </TableCell>
                        <TableCell className="font-semibold text-foreground">
                            {submission.student.name || submission.student.email}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                            {format(new Date(submission.submittedAt), 'MMM dd, HH:mm')}
                        </TableCell>
                        <TableCell className="text-lg font-bold font-mono text-primary">
                            {submission.grade !== null ? submission.grade : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                            {/* Nút bấm chuyển hướng sang trang Chấm điểm chi tiết */}
                            <Button variant="outline" size="sm" asChild className="hover:bg-primary hover:text-primary-foreground transition-colors border-primary/30">
                                <Link href={`/dashboard/${assignmentData.class.id}/assignments/${assignmentId}/submissions/${submission.id}`}>
                                    View & Grade 📝
                                </Link>
                            </Button>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </div>
        )}
      </CardContent>
    </Card>
  );
}