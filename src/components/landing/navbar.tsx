import Link from "next/link";
import { auth, signIn } from "@/auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export async function LandingNavbar() {
  const session = await auth();

  return (
    <nav className="fixed top-0 w-full z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto bg-[#0a1205]/70 backdrop-blur-md border border-[#D9CCAC]/10 rounded-full px-6 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D9CCAC] to-[#43602A] items-center justify-center hidden xs:flex">
            <span className="font-bold text-[#0a1205]">Ý</span>
          </div>
          <span className="text-xl font-bold text-[#D9CCAC] tracking-wide">YLearning</span>
        </Link>

        {/* Menu Desktop */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
          <a href="#features" className="hover:text-[#D9CCAC] transition-colors">Features</a>
          <a href="#mentors" className="hover:text-[#D9CCAC] transition-colors">Mentors</a>
          <a href="#reviews" className="hover:text-[#D9CCAC] transition-colors">Reviews</a>
        </div>

        {/* CTA Button (Logic Auth) */}
        {session ? (
          <div className="flex items-center gap-4">
             <Link href="/dashboard">
                <Button className="bg-[#D9CCAC] hover:bg-[#c4b595] text-[#43602A] rounded-full font-bold border-none">
                   Go to Dashboard
                </Button>
             </Link>
             <Avatar className="h-8 w-8 border border-[#D9CCAC]/50">
                <AvatarImage src={session.user?.image || ""} />
                <AvatarFallback>U</AvatarFallback>
             </Avatar>
          </div>
        ) : (
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/dashboard" });
            }}
          >
            <button className="bg-[#D9CCAC] hover:bg-[#c4b595] text-[#43602A] px-5 py-2 rounded-full font-bold text-sm transition-all shadow-[0_0_15px_rgba(217,204,172,0.3)]">
              Sign In
            </button>
          </form>
        )}
      </div>
    </nav>
  );
}