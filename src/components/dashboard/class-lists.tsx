"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ClassListsProps {
  teachingClasses: any[];
  enrolledClasses: any[];
}

export function ClassLists({ teachingClasses, enrolledClasses }: ClassListsProps) {
  return (
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
  );
}