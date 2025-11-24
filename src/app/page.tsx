import { LandingNavbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Features, TeamSection, Footer } from "@/components/landing/sections";
import { Testimonials } from "@/components/landing/Testimonials";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a1205] text-slate-200 font-sans selection:bg-[#43602A] selection:text-white">
      {/* Style Global cho Animation */}
      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          animation: gradient 4s ease infinite;
        }
      `}</style>
      
      <LandingNavbar />
      <Hero />
      <Features />
      <Testimonials />
      <TeamSection />
      <Footer />
    </div>
  );
}