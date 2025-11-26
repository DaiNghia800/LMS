"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CreateAssignmentForm } from "@/components/create-assignment-form";
import { Plus } from "lucide-react";

export function CreateAssignmentButton({ classId }: { classId: string }) {
  const [open, setOpen] = useState(false); // Biến quản lý đóng mở

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md font-bold xs:mt-0 mt-3">
            <Plus className="w-4 h-4 mr-2" /> New Assignment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Assignment</DialogTitle>
          <DialogDescription>Add a new task for your students.</DialogDescription>
        </DialogHeader>
        
        {/* 👇 QUAN TRỌNG: Truyền hàm setOpen(false) để đóng form khi xong */}
        <CreateAssignmentForm 
            classId={classId} 
            onSuccess={() => setOpen(false)} 
        />
        
      </DialogContent>
    </Dialog>
  );
}