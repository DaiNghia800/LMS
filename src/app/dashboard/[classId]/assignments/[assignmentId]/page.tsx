import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; 
import { QuestionBuilder } from "@/components/question-builder"; // Import Component vừa tạo
import { AssignmentSubmissionsTab } from "@/components/assignment-submissions-tab"; 
import { Badge } from "@/components/ui/badge";

interface Props {
  params: Promise<{ classId: string; assignmentId: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export default async function AssignmentBuilderPage({ params, searchParams }: Props) {
  const session = await auth();
  if (!session) redirect("/");

  const { classId, assignmentId } = await params;
  const { tab } = await searchParams;
  
  // Fetch Data
  const assignmentDetail = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: {
      class: true,
      questions: {
        orderBy: { createdAt: 'asc' } // Lấy câu hỏi
      },
    },
  });

  if (!assignmentDetail) return <div>Assignment not found.</div>;

  // Bảo mật: Chỉ giáo viên mới vào được
  if (assignmentDetail.class.teacherId !== (session.user as any).id) {
      redirect(`/dashboard/${classId}`);
  }

  // Format dữ liệu câu hỏi để truyền xuống Client Component
  const formattedQuestions = assignmentDetail.questions.map(q => ({
      id: q.id,
      text: q.text,
      type: q.type,
      options: q.options,
      correctAnswer: q.correctAnswer || "",
      mediaUrl: q.mediaUrl || undefined,
      mediaType: q.mediaType || undefined,
      points: q.points
  }));

  const defaultTab = tab === "submissions" ? "submissions" : "questions";

  return (
    <div className="min-h-screen bg-background p-8 pb-32">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex justify-between items-center pb-4 border-b">
            <Link href={`/dashboard/${classId}`}>
                <Button variant="outline" size="sm" className="text-muted-foreground">
                    ← Back to {assignmentDetail.class.name}
                </Button>
            </Link>
            <div className="text-center">
                <h1 className="text-3xl font-bold text-foreground">
                    Manage: {assignmentDetail.title}
                </h1>
                <Badge variant="secondary" className="mt-1">Code: {assignmentId.substring(0, 8)}</Badge>
            </div>
            <div className="w-20"></div> {/* Spacer */}
        </div>

        {/* TABS */}
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="questions">✏️ Questions Builder</TabsTrigger>
            <TabsTrigger value="submissions">📝 Submissions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="questions">
            <QuestionBuilder 
                assignmentId={assignmentId} 
                initialQuestions={formattedQuestions as any} 
            />
          </TabsContent>

          <TabsContent value="submissions">
            <AssignmentSubmissionsTab assignmentId={assignmentId} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}