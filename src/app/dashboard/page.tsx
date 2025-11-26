import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createClass, joinClass } from "@/actions/class";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ModeToggle } from "@/components/mode-toggle";
import React from "react";
import { UserNav } from "@/components/user-nav";
import { Home } from "lucide-react";
import { DashboardChart } from "@/components/dashboard-chart";
export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/");

  // Fetch data
  const teachingClasses = await prisma.class.findMany({
    where: { teacherId: (session.user as any).id },
    orderBy: { createdAt: "desc" },
  });

  const enrolledClasses = await prisma.class.findMany({
    where: {
      members: {
        some: { userId: (session.user as any).id },
      },
    },
    include: { teacher: true },
    orderBy: { createdAt: "desc" },
  });

  const teachingClassesWithCounts = await prisma.class.findMany({
    where: { teacherId: (session.user as any).id },
    include: {
        _count: {
            select: { assignments: true } // Đếm số bài tập
        }
    },
    orderBy: { createdAt: "desc" },
    take: 5 
  });

  // Format dữ liệu cho Recharts
  const chartData = teachingClassesWithCounts.map(cls => ({
      name: cls.name,
      submissions: cls._count.assignments 
  }));

  return (
    <div className="min-h-screen bg-background xs:p-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Manage your learning journey.</p>
          </div>
        </div>
        {chartData.length > 0 && (
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-7">
                
                {/* 1. CỘT TRÁI: BIỂU ĐỒ (Chiếm 4/7 chiều rộng) */}
                <div className="lg:col-span-4">
                    <DashboardChart data={chartData} />
                </div>
                
                {/* 2. CỘT PHẢI: THẺ THỐNG KÊ (Chiếm 3/7 chiều rộng) */}
                <div className="lg:col-span-3 flex flex-col gap-6">
                    
                    {/* Thẻ 1: Total Classes */}
                    <div className="flex-1 bg-primary/10 p-6 rounded-xl border border-primary/20 flex flex-col justify-center shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary text-white rounded-full">
                                {/* Icon Sách */}
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-primary">Total Classes</h3>
                                <p className="text-4xl font-bold text-foreground">{teachingClasses.length}</p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Thẻ 2: Enrolled Courses */}
                    <div className="flex-1 bg-secondary/50 p-6 rounded-xl border border-secondary flex flex-col justify-center shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-secondary text-secondary-foreground rounded-full">
                                {/* Icon Người dùng */}
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-foreground">Enrolled Courses</h3>
                                <p className="text-4xl font-bold text-foreground">{enrolledClasses.length}</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        )}
              
        {/* ACTIONS */}
        <div className="flex gap-4">
          <Dialog>
            <DialogTrigger asChild>
              {/* Nút chính tự động nhận màu Xanh Rêu */}
              <Button>+ Create Class</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Class</DialogTitle>
                <DialogDescription>For teachers only.</DialogDescription>
              </DialogHeader>
              <form action={createClass as any} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Class Name</Label>
                  <Input name="className" required placeholder="Advanced React" />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input name="description" placeholder="Optional..." />
                </div>
                <DialogFooter>
                  <Button type="submit">Create</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              {/* Nút phụ tự động nhận màu Be */}
              <Button variant="secondary">Join Class</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Join a Class</DialogTitle>
                <DialogDescription>Enter the code given by your teacher.</DialogDescription>
              </DialogHeader>
              <form action={joinClass as any} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Invite Code</Label>
                  <Input name="inviteCode" required placeholder="e.g. A1B2C3" />
                </div>
                <DialogFooter>
                  <Button type="submit">Join Now</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* TABS */}
        <Tabs defaultValue="teaching" className="w-full">
          <TabsList className="bg-muted">
            <TabsTrigger value="teaching">Classes I Teach ({teachingClasses.length})</TabsTrigger>
            <TabsTrigger value="enrolled">Enrolled Classes ({enrolledClasses.length})</TabsTrigger>
          </TabsList>

          {/* TAB: TEACHING */}
          <TabsContent value="teaching" className="mt-6">
            {teachingClasses.length === 0 ? (
              <p className="text-muted-foreground italic">You haven't created any classes yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {teachingClasses.map((cls) => (
                  <Card key={cls.id} className="hover:shadow-md transition cursor-pointer border-border bg-card">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        {/* Tiêu đề dùng màu chính (Primary - Xanh Rêu) */}
                        <CardTitle className="text-lg font-bold text-primary truncate">{cls.name}</CardTitle>
                        <span className="text-xs font-mono bg-secondary text-secondary-foreground px-2 py-1 rounded border h-fit">
                          {cls.inviteCode}
                        </span>
                      </div>
                      <CardDescription className="line-clamp-1">{cls.description}</CardDescription>
                    </CardHeader>
                    <CardFooter>
                      <Button asChild variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-white">
                        <Link href={`/dashboard/${cls.id}`}>
                            Manage Class
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* TAB: ENROLLED */}
          <TabsContent value="enrolled" className="mt-6">
            {enrolledClasses.length === 0 ? (
              <p className="text-muted-foreground italic">You haven't joined any classes yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {enrolledClasses.map((cls) => (
                  <Card key={cls.id} className="hover:shadow-md transition bg-card border-border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-bold text-foreground truncate">{cls.name}</CardTitle>
                      <CardDescription>Teacher: {cls.teacher?.name}</CardDescription>
                    </CardHeader>
                    <CardFooter>
                      <Button asChild className="w-full bg-primary text-primary-foreground hover:opacity-90">
                        <Link href={`/dashboard/${cls.id}`}>
                            Enter Class
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}