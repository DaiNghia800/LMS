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

  return (
    <div className="min-h-screen bg-background p-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Manage your learning journey.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild title="Back to Home">
              <Link href="/">
                  <Home className="h-[1.2rem] w-[1.2rem]" />
              </Link>
            </Button>
            <ModeToggle />
            <UserNav user={session?.user} />
          </div>
        </div>
              
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