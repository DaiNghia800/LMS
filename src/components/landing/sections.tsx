import React from 'react';
import { Users, Trophy, CheckCircle, Code, Zap } from 'lucide-react';
import Image from 'next/image';

// --- FEATURES SECTION ---
export const Features = () => {
  const features = [
    {
      title: "AI Personalization",
      desc: "AI-powered system for automatic grading and personalized learning path suggestions.",
      icon: <Users className="text-[#D9CCAC]" />,
    },
    {
      title: "Interactive Quiz",
      desc: "Intelligent system for multiple-choice and essay exercises.",
      icon: <Trophy className="text-[#D9CCAC]" />,
    },
    {
      title: "Real-time Analytics",
      desc: "Track learning progress and scores in real time.",
      icon: <CheckCircle className="text-[#D9CCAC]" />,
    },
  ];

  return (
    <section id="features" className="py-20 px-6 bg-[#050c04]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Why choose YLearning?</h2>
          <p className="text-gray-400">The most advanced educational technology at your fingertips.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((item, idx) => (
            <div key={idx} className="group relative p-8 rounded-3xl bg-[#0f1a10] border border-[#43602A]/30 hover:border-[#D9CCAC]/50 transition-all duration-300 hover:-translate-y-2 overflow-hidden">
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

// --- TEAM SECTION ---
export const TeamSection = () => {
  const teamMembers = [
    { 
      name: "DaiNghia", 
      role: "Founder & Dev", 
      handle: "@dainghia800", 
      gradient: "from-[#43602A] via-[#2f451e] to-[#0a1205]", 
      icon: <Code size={64} className="text-[#D9CCAC]" />,
      image: "/images/ngir.jpg" 
    },
    { 
      name: "NhuY", 
      role: "Teacher", 
      handle: "@nhuy800", 
      gradient: "from-pink-900 via-pink-700 to-[#0a1205]", 
      icon: <Zap size={64} className="text-pink-200" />, 
      // 👇 Đảm bảo file này tồn tại
      image: "/images/yr.jpg" 
    }
  ];

  return (
    <section id="mentors" className="py-24 px-6 bg-[#050c04]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Meet the Creator</h2>
          <p className="text-gray-400 text-lg">The visionary behind this passionate project.</p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-8">
          {teamMembers.map((member, index) => (
            <div key={index} className={`group relative p-4 rounded-[2rem] bg-[#0f1a10] border border-[#43602A]/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_0_40px_rgba(67,96,42,0.5)] border-opacity-50 hover:border-opacity-100 w-full max-w-sm`}>
              
              {/* Khung chứa Ảnh/Icon */}
              <div className={`w-full aspect-square rounded-[1.5rem] bg-gradient-to-b ${member.gradient} flex items-center justify-center relative overflow-hidden mb-5 border border-white/5`}>
                 
                 {/* LOGIC: Có ảnh thì hiện ảnh, không thì hiện icon */}
                 {member.image ? (
                   <div className="relative w-full h-full group-hover:scale-105 transition-transform duration-700 ease-out">
                      <Image 
                        src={member.image} 
                        alt={member.name} 
                        fill 
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                      {/* Lớp phủ nhẹ khi hover để làm nổi bật text (tùy chọn) */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                   </div>
                 ) : (
                   <div className="transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 drop-shadow-2xl">
                      {member.icon}
                   </div>
                 )}

                 {/* Hiệu ứng ánh sáng lướt qua */}
                 <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </div>

              {/* Thông tin thành viên */}
              <div className="px-2 pb-2 text-center">
                 <h3 className="text-xl font-bold text-white group-hover:text-[#D9CCAC] transition-colors">{member.name}</h3>
                 <p className="text-[#D9CCAC]/80 text-sm font-medium mt-1 uppercase tracking-wider">{member.role}</p>
                 <p className="text-gray-500 text-xs mt-2 hover:text-white cursor-pointer transition-colors">{member.handle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// --- FOOTER SECTION ---
export const Footer = () => (
  <footer className="border-t border-[#ffffff]/10 bg-[#050c04] pt-16 pb-8 px-6">
    <div className="max-w-7xl mx-auto pt-8 text-center text-gray-600 text-sm">
      © 2025 LMS Pro. Built by DaiNghia.
    </div>
  </footer>
);