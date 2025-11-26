import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createClass, joinClass } from "@/actions/class";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ClassLists } from "@/components/dashboard/class-lists"; // Import component vừa tạo

export default async function ClassesPage() {
  const session = await auth();
  if (!session) redirect("/");

  const userId = (session.user as any).id;

  // Fetch data
  const teachingClasses = await prisma.class.findMany({
    where: { teacherId: userId },
    orderBy: { createdAt: "desc" },
  });

  const enrolledClasses = await prisma.class.findMany({
    where: {
      members: { some: { userId: userId } },
    },
    include: { teacher: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center xs:flex-nowrap flex-wrap xs:gap-0 gap-4">
         <h2 className="text-3xl font-bold tracking-tight">My Classes</h2>
         
         {/* ACTIONS BUTTONS */}
         <div className="flex gap-4">
          {/* CREATE CLASS */}
          <Dialog>
            <DialogTrigger asChild>
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

          {/* JOIN CLASS */}
          <Dialog>
            <DialogTrigger asChild>
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
      </div>

      {/* COMPONENT DANH SÁCH LỚP */}
      <ClassLists teachingClasses={teachingClasses} enrolledClasses={enrolledClasses} />
      
    </div>
  );
}