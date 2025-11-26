"use client"
import { ArrowRight, BookOpen, Trophy } from 'lucide-react';
import Link from 'next/link';
import { TypeAnimation } from 'react-type-animation';
export const Hero = () => (
  <section className="relative xs:pt-40 pt-32 pb-20 px-6 overflow-hidden">
    {/* Background Glow Effect */}
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
        <TypeAnimation
            sequence={[
              'Master Your Skills',
              2000,
              '',
              400
            ]}
            wrapper="span"
            speed={50}
            repeat={Infinity}
            cursor={true}
          />
        <br />
        <span className="bg-gradient-to-r from-[#D9CCAC] via-[#43602A] to-[#D9CCAC] text-transparent bg-clip-text bg-[length:200%_auto] animate-gradient">
          Earn Your Future
        </span>
      </h1>
      
      <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10">
        A modern AI-powered LMS platform. <br/> Real learning, real practice, smart assignment management.
      </p>

      <div className="flex flex-col md:flex-row items-center justify-center gap-4">
        <Link href="/dashboard">
            <button className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-[#D9CCAC] to-[#D9CCAC] hover:to-white text-[#0a1205] font-bold rounded-2xl transition-transform hover:-translate-y-1 flex items-center justify-center gap-2">
            Get Started Now <ArrowRight size={20} />
            </button>
        </Link>
        <button className="w-full md:w-auto px-8 py-4 bg-[#ffffff]/5 border border-[#ffffff]/10 text-white font-semibold rounded-2xl hover:bg-[#ffffff]/10 transition-all">
          View Demo
        </button>
      </div>
    </div>
    
    {/* Floating Elements */}
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