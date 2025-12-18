import { motion } from "motion/react";
import { Reveal } from "../animations/Reveal";
import { Check, X, Zap, Layers, MousePointer2, Sparkles, Smartphone, Globe } from "lucide-react";

export function TechComparison() {
  const features = [
    {
      name: "Performance",
      icon: <Zap className="w-5 h-5 text-[#8E8567]" />,
      standard: "Standard Page Loads",
      standardDesc: "Pages load only when clicked, causing delay.",
      premium: "Predictive Pre-fetching",
      premiumDesc: "AI anticipates your next move, loading content instantly.",
      highlight: true
    },
    {
      name: "Visual Experience",
      icon: <Layers className="w-5 h-5 text-[#8E8567]" />,
      standard: "Static Templates",
      standardDesc: "Generic layouts used by thousands of agencies.",
      premium: "Cinematic Motion",
      premiumDesc: "Fluid transitions and bespoke animations tailored to luxury.",
      highlight: true
    },
    {
      name: "Responsiveness",
      icon: <Smartphone className="w-5 h-5 text-[#8E8567]" />,
      standard: "Basic Mobile View",
      standardDesc: "Simply stacks content vertically.",
      premium: "Adaptive Design",
      premiumDesc: "Intelligent layouts that re-architect specifically for touch.",
      highlight: false
    },
    {
      name: "Technology",
      icon: <Globe className="w-5 h-5 text-[#8E8567]" />,
      standard: "Webflow / WordPress",
      standardDesc: "Restricted by template limitations.",
      premium: "React + AI Architecture",
      premiumDesc: "Limitless custom code powered by modern app infrastructure.",
      highlight: true
    }
  ];

  return (
    <section className="w-full py-24 bg-gray-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#8E8567]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#1A2551]/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 relative z-10">
        <div className="text-center mb-16">
          <Reveal width="100%" variant="fade-in">
            <span 
              className="text-[#8E8567] text-sm font-bold tracking-[0.2em] uppercase block mb-4"
              style={{ fontFamily: "'Figtree', sans-serif" }}
            >
              The Digital Advantage
            </span>
          </Reveal>
          
          <Reveal width="100%" delay={0.1}>
            <h2 
              className="text-3xl md:text-5xl text-[#1A2551] mb-6 max-w-3xl mx-auto leading-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Why we built Bartlett & Partners on next-generation infrastructure.
            </h2>
          </Reveal>
          
          <Reveal width="100%" delay={0.2}>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg font-light leading-relaxed">
              In a world of generic templates, we chose to build a bespoke digital platform that matches the quality of the homes we represent.
            </p>
          </Reveal>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Desktop Header */}
          <div className="hidden md:grid grid-cols-12 bg-[#1A2551] text-white py-6 px-8 items-center">
            <div className="col-span-4 font-medium tracking-wide uppercase text-sm opacity-70">Feature</div>
            <div className="col-span-4 font-medium tracking-wide uppercase text-sm opacity-70">Standard Industry Website</div>
            <div className="col-span-4 font-medium tracking-wide uppercase text-sm text-[#8E8567]">Bartlett & Partners</div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-gray-100">
            {features.map((feature, index) => (
              <Reveal key={index} width="100%" delay={index * 0.1} variant="slide-up">
                <div 
                  className={`grid grid-cols-1 md:grid-cols-12 px-8 py-8 md:py-10 items-center transition-colors duration-300 hover:bg-gray-50/50 ${feature.highlight ? 'bg-gradient-to-r from-transparent to-[#8E8567]/5' : ''}`}
                >
                  {/* Feature Name */}
                  <div className="col-span-1 md:col-span-4 flex items-center gap-4 mb-4 md:mb-0">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                      {feature.icon}
                    </div>
                    <h3 className="text-lg font-medium text-[#1A2551]" style={{ fontFamily: "'Figtree', sans-serif" }}>
                      {feature.name}
                    </h3>
                  </div>

                  {/* Standard */}
                  <div className="col-span-1 md:col-span-4 mb-4 md:mb-0 pl-14 md:pl-0 relative">
                    <div className="absolute left-0 top-0 md:hidden">
                       <div className="w-10 h-10 flex items-center justify-center">
                          <span className="text-xs font-bold text-gray-400 uppercase rotate-90 origin-center translate-y-4 -translate-x-2">Standard</span>
                       </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-gray-800 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                            {feature.standard}
                        </div>
                        <p className="text-sm text-gray-500 font-light">{feature.standardDesc}</p>
                    </div>
                  </div>

                  {/* Premium */}
                  <div className="col-span-1 md:col-span-4 pl-14 md:pl-0 relative">
                     <div className="absolute left-0 top-0 md:hidden">
                       <div className="w-10 h-10 flex items-center justify-center">
                          <span className="text-xs font-bold text-[#8E8567] uppercase rotate-90 origin-center translate-y-4 -translate-x-2">Premium</span>
                       </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-[#1A2551] font-bold">
                            <Sparkles className="w-3 h-3 text-[#8E8567]" />
                            {feature.premium}
                        </div>
                        <p className="text-sm text-[#1A2551]/70 font-light">{feature.premiumDesc}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}