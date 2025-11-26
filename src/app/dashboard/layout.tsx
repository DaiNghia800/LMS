import { DashboardNav } from "@/components/dashboard-nav";
import { UserNav } from "@/components/user-nav";
import { ModeToggle } from "@/components/mode-toggle";
import Link from "next/link";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="flex min-h-screen flex-col space-y-6 bg-background/50">
      {/* HEADER CỐ ĐỊNH Ở TRÊN CÙNG */}
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D9CCAC] to-[#43602A] flex items-center justify-center text-white font-bold">Ý</div>
                <span className="text-lg font-bold tracking-tight text-primary">YLearning</span>
            </div>
            
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild title="Go Home">
                    <Link href="/"><Home className="w-5 h-5"/></Link>
                </Button>
                <ModeToggle />
                <UserNav user={session?.user} />
            </div>
        </div>
      </header>

      <div className="container !mt-0 grid flex-1 gap-12 md:grid-cols-[200px_1fr]">
        {/* SIDEBAR BÊN TRÁI */}
        <aside className="hidden border-r w-[200px] flex-col md:flex">
          <DashboardNav />
        </aside>
        
        {/* NỘI DUNG CHÍNH BÊN PHẢI */}
        <main className="flex pt-6 w-full flex-1 flex-col overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}