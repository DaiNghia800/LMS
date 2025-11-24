import { Star } from 'lucide-react';
export const Testimonials = () => (
  <section id="reviews" className="py-20 px-6 relative">
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