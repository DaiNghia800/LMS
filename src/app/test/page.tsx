"use client"
import React from 'react';
import { ArrowRight, BookOpen, Trophy, Users, Star, CheckCircle } from 'lucide-react';
import { Github, Twitter, Code, Zap, Diamond } from 'lucide-react';
import Image from 'next/image';
// --- COMPONENTS ---

// 1. Navigation: Floating Glassmorphism
const Navbar = () => (
  <nav className="fixed top-0 w-full z-50 px-6 py-4">
    <div className="max-w-7xl mx-auto bg-[#0a1205]/70 backdrop-blur-md border border-[#D9CCAC]/10 rounded-full px-6 py-3 flex justify-between items-center">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D9CCAC] to-[#43602A] flex items-center justify-center">
          <span className="font-bold text-[#0a1205]">L</span>
        </div>
        <span className="text-xl font-bold text-[#D9CCAC] tracking-wide">LMS PRO</span>
      </div>

      {/* Menu Desktop */}
      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
        <a href="#" className="hover:text-[#D9CCAC] transition-colors">Courses</a>
        <a href="#" className="hover:text-[#D9CCAC] transition-colors">Mentors</a>
        <a href="#" className="hover:text-[#D9CCAC] transition-colors">Pricing</a>
      </div>

      {/* CTA Button */}
      <button className="bg-[#D9CCAC] hover:bg-[#c4b595] text-[#43602A] px-5 py-2 rounded-full font-bold text-sm transition-all shadow-[0_0_15px_rgba(217,204,172,0.3)]">
        Connect Wallet
      </button>
    </div>
  </nav>
);

// 2. Hero Section: Web3 Vibe, Big Gradient Text
const Hero = () => (
  <section className="relative pt-40 pb-20 px-6 overflow-hidden">
    {/* Background Glow Effect (giống Purro) */}
    <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#43602A] opacity-20 blur-[120px] rounded-full pointer-events-none" />
    
    <div className="max-w-4xl mx-auto text-center relative z-10">
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#43602A]/20 border border-[#43602A]/40 text-[#D9CCAC] text-sm font-medium mb-6">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D9CCAC] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D9CCAC]"></span>
        </span>
        Next-generation learning system
      </div>

      <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight tracking-tight mb-6">
        Master Your Skills <br />
        <span className="bg-gradient-to-r from-[#D9CCAC] via-[#43602A] to-[#D9CCAC] text-transparent bg-clip-text bg-[length:200%_auto] animate-gradient">
          Earn Your Future
        </span>
      </h1>
      
      <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10">
        A decentralized LMS platform. <br></br> Learn for real, build for real, and earn NFT certificates.
      </p>

      <div className="flex flex-col md:flex-row items-center justify-center gap-4">
        <button className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-[#D9CCAC] to-[#D9CCAC] hover:to-white text-[#0a1205] font-bold rounded-2xl transition-transform hover:-translate-y-1 flex items-center justify-center gap-2">
          Get Started Now <ArrowRight size={20} />
        </button>
        <button className="w-full md:w-auto px-8 py-4 bg-[#ffffff]/5 border border-[#ffffff]/10 text-white font-semibold rounded-2xl hover:bg-[#ffffff]/10 transition-all">
          View Demo
        </button>
      </div>
    </div>
    
    {/* Floating Elements (Giống hình mèo Purro nhưng là icon học tập) */}
    <div className="hidden lg:block absolute top-1/3 right-[10%] animate-bounce duration-[3000ms]">
      <div className="w-20 h-20 bg-gradient-to-br from-[#43602A] to-black rounded-2xl border border-[#D9CCAC]/30 flex items-center justify-center backdrop-blur-xl rotate-12">
        <Trophy className="text-[#D9CCAC] w-10 h-10" />
      </div>
    </div>
    <div className="hidden lg:block absolute bottom-20 left-[10%] animate-bounce duration-[4000ms]">
      <div className="w-16 h-16 bg-gradient-to-br from-[#D9CCAC] to-black rounded-2xl border border-[#D9CCAC]/30 flex items-center justify-center backdrop-blur-xl -rotate-6">
        <BookOpen className="text-[#0a1205] w-8 h-8" />
      </div>
    </div>
  </section>
);

// 3. Features Block: Dark Cards, Green Accents
const Features = () => {
  const features = [
    {
      title: "AI Personalization",
      desc: "Personalized learning paths powered by AI, adapting to your pace.",
      icon: <Users className="text-[#D9CCAC]" />,
    },
    {
      title: "Gamification & NFT",
      desc: "Complete courses to earn NFT badges and token rewards.",
      icon: <Trophy className="text-[#D9CCAC]" />,
    },
    {
      title: "Real-time Analytics",
      desc: "Track your progress in real time with an intuitive dashboard.",
      icon: <CheckCircle className="text-[#D9CCAC]" />,
    },
  ];

  return (
    <section className="py-20 px-6 bg-[#050c04]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Why choose LMS Pro?</h2>
          <p className="text-gray-400">The most advanced educational technology at your fingertips.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((item, idx) => (
            <div key={idx} className="group relative p-8 rounded-3xl bg-[#0f1a10] border border-[#43602A]/30 hover:border-[#D9CCAC]/50 transition-all duration-300 hover:-translate-y-2 overflow-hidden">
              {/* Hover Gradient Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#43602A]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="w-12 h-12 rounded-xl bg-[#43602A]/20 flex items-center justify-center mb-6 border border-[#43602A]/50 group-hover:bg-[#D9CCAC] group-hover:border-[#D9CCAC] transition-colors">
                {React.cloneElement(item.icon as React.ReactElement<any>, { 
                    className: "text-[#D9CCAC] group-hover:text-[#43602A] transition-colors" 
                })}
              </div>
              <h3 className="text-xl font-bold text-white mb-3 relative z-10">{item.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed relative z-10">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// 4. Testimonials: Minimalist & Trust
const Testimonials = () => (
  <section className="py-20 px-6 relative">
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row gap-12 items-center">
        {/* Left Side: Stats */}
        <div className="w-full md:w-1/2">
          <h2 className="text-4xl font-bold text-white mb-6">
            Trusted by  <br/>
            <span className="text-[#D9CCAC]">10,000+ learners</span>
          </h2>
          <div className="grid grid-cols-2 gap-6 mt-8">
            <div className="p-6 rounded-2xl bg-[#0f1a10] border border-[#ffffff]/5">
              <p className="text-3xl font-bold text-white">98%</p>
              <p className="text-sm text-gray-400 mt-1">Absolute satisfaction</p>
            </div>
            <div className="p-6 rounded-2xl bg-[#0f1a10] border border-[#ffffff]/5">
              <p className="text-3xl font-bold text-white">50+</p>
              <p className="text-sm text-gray-400 mt-1">Corporate partners</p>
            </div>
          </div>
        </div>

        {/* Right Side: Review Card */}
        <div className="w-full md:w-1/2 relative">
          <div className="absolute inset-0 bg-[#D9CCAC] blur-[60px] opacity-10 rounded-full" />
          <div className="relative p-8 rounded-3xl bg-[#152015]/80 backdrop-blur border border-[#43602A]/40">
            <div className="flex gap-1 text-[#D9CCAC] mb-4">
              {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={16} fill="#D9CCAC" />)}
            </div>
            <p className="text-lg text-gray-200 italic mb-6">
              “The LMS Pro interface is truly different. It doesn’t feel like a boring school — it feels like a game that makes me want to log in every day.”
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-600 overflow-hidden">
                {/* Placeholder Avatar */}
                <div className="w-full h-full bg-gradient-to-tr from-[#D9CCAC] to-[#43602A]" />
              </div>
              <div>
                <h4 className="font-bold text-white">Mr Hoang</h4>
                <p className="text-sm text-[#D9CCAC]">Senior Developer</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const TeamSection = () => {
  const teamMembers = [
    {
      name: "DaiNghia",
      role: "Founder",
      handle: "@dainghia800",
      gradient: "from-blue-900 via-blue-700 to-[#0a1205]",
      icon: <Diamond size={64} className="text-blue-200" />,
      glowColor: "group-hover:shadow-blue-900/50",
      image: "/images/ngir.jpg"
    },
    {
      name: "DaiNghia",
      role: "Marketer",
      handle: "@nhuy",
      gradient: "from-pink-900 via-pink-700 to-[#0a1205]",
      icon: <Zap size={64} className="text-pink-200" />,
      glowColor: "group-hover:shadow-pink-900/50",
      image: "/images/yr.jpg"
    },
    {
      name: "DaiNghia",
      role: "Developer",
      handle: "@dainghia800",
      gradient: "from-[#43602A] via-[#2f451e] to-[#0a1205]",
      icon: <Code size={64} className="text-[#D9CCAC]" />,
      glowColor: "group-hover:shadow-[#43602A]/50",
      image: "/images/ngir.jpg"
    },
  ];

  return (
    <section className="py-24 px-6 bg-[#050c04]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Meet the team
          </h2>
          <p className="text-gray-400 text-lg">
            Builders, designers, and <span className="text-[#D9CCAC] line-through decoration-[#43602A]">degens</span> learners behind LMS Pro.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {teamMembers.map((member, index) => (
            <div 
              key={index} 
              className={`group relative p-4 rounded-[2rem] bg-[#0f1a10] border border-[#43602A]/30 transition-all duration-500 hover:-translate-y-2 ${member.glowColor} hover:shadow-[0_0_40px_rgba(0,0,0,0.5)] border-opacity-50 hover:border-opacity-100`}
            >
              {/* IMAGE / ICON CONTAINER */}
              <div className={`w-full aspect-square rounded-[1.5rem] bg-gradient-to-b ${member.gradient} flex items-center justify-center relative overflow-hidden mb-5 border border-white/5`}>
                
                {/* LOGIC HIỂN THỊ: Có ảnh thì hiện ảnh, không thì hiện Icon */}
                {member.image ? (
                  <div className="relative w-full h-full group-hover:scale-105 transition-transform duration-500">
                     <Image 
                        src={member.image}
                        alt={member.name}
                        fill
                        className="object-cover" // Giúp ảnh luôn lấp đầy khung vuông mà không bị méo
                        sizes="(max-width: 768px) 100vw, 33vw"
                     />
                     {/* Overlay màu nhẹ khi hover để text dễ đọc hơn nếu ảnh quá sáng */}
                     <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  </div>
                ) : (
                  // Fallback: Nếu không có ảnh thì hiện Icon + Noise texture cũ
                  <>
                    <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
                    <div className="transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 drop-shadow-2xl">
                      {member.icon}
                    </div>
                  </>
                )}

                {/* Shine effect chung cho cả ảnh và icon */}
                <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </div>

              {/* Info Section - Giữ nguyên */}
              <div className="px-2 pb-2">
                <div className="flex justify-between items-end">
                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-[#D9CCAC] transition-colors">
                      {member.name}
                    </h3>
                    <p className="text-[#D9CCAC]/80 text-sm font-medium mt-1 uppercase tracking-wider">
                      {member.role}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-gray-500 text-sm hover:text-white transition-colors cursor-pointer flex items-center gap-1 justify-end">
                       {member.handle}
                    </p>
                    <div className="flex gap-2 mt-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                      <Twitter size={14} className="text-gray-400 hover:text-[#D9CCAC]" />
                      <Github size={14} className="text-gray-400 hover:text-[#D9CCAC]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// 5. Footer: Simple & Clean
const Footer = () => (
  <footer className="border-t border-[#ffffff]/10 bg-[#050c04] pt-16 pb-8 px-6">
    <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8 mb-12">
      <div className="col-span-1 md:col-span-1">
        <span className="text-2xl font-bold text-white mb-4 block">LMS PRO</span>
        <p className="text-gray-500 text-sm">
          The leading decentralized learning platform. <br/>Built to learn - Ready to earn.
        </p>
      </div>
      
      {['Platform', 'Resources', 'Company'].map((head) => (
        <div key={head}>
          <h4 className="font-bold text-white mb-4">{head}</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><a href="#" className="hover:text-[#D9CCAC] transition">Link one</a></li>
            <li><a href="#" className="hover:text-[#D9CCAC] transition">Link two</a></li>
            <li><a href="#" className="hover:text-[#D9CCAC] transition">Link three</a></li>
          </ul>
        </div>
      ))}
    </div>
    
    <div className="max-w-7xl mx-auto pt-8 border-t border-[#ffffff]/5 text-center text-gray-600 text-sm">
      © 2025 LMS Pro. Inspired by Purro Wallet Style.
    </div>
  </footer>
);

// --- MAIN PAGE ---
export default function LMSLandingPage() {
  return (
    <div className="min-h-screen bg-[#0a1205] text-slate-200 font-sans selection:bg-[#43602A] selection:text-white">
      <style jsx global>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          animation: gradient 4s ease infinite;
        }
      `}</style>
      
      <Navbar />
      <Hero />
      <Features />
      <Testimonials />
      <TeamSection />
      <Footer />
    </div>
  );
}