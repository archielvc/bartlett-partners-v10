import { motion } from "motion/react";
import { Compass, BarChart3, Trophy } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Consultation",
    description: "We start by listening. Understanding your goals, your timeline, and the unique character of your property allows us to build a bespoke strategy.",
    icon: <Compass className="w-8 h-8 text-[#8E8567]" />
  },
  {
    number: "02",
    title: "Strategy & Marketing",
    description: "Using data-driven insights and world-class creative marketing, we position your property to attract the right buyers, not just any buyers.",
    icon: <BarChart3 className="w-8 h-8 text-[#8E8567]" />
  },
  {
    number: "03",
    title: "Execution & Success",
    description: "We manage every viewing, negotiation, and legal detail with precision, ensuring a smooth journey to completion and the best possible price.",
    icon: <Trophy className="w-8 h-8 text-[#8E8567]" />
  }
];

export function AboutProcess() {
  return (
    <section className="w-full bg-[#1A2551] px-6 md:px-12 lg:px-20 py-24 text-white">
      <div className="max-w-[1600px] mx-auto">
        <div className="text-center mb-20">
           <span className="block text-[#8E8567] text-sm tracking-widest uppercase mb-4 font-bold" style={{ fontFamily: "'Figtree', sans-serif" }}>
              How We Work
            </span>
            <h2 
              className="text-white text-4xl md:text-5xl"
              style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
            >
              The Bartlett Process
            </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Connecting Line (Desktop only) */}
          <div className="hidden md:block absolute top-12 left-0 right-0 h-[1px] bg-white/10 -z-0 transform -translate-y-1/2" />

          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="relative z-10 bg-[#1A2551]" // Background matches section to hide line behind content
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-[#1A2551] border border-[#8E8567]/30 flex items-center justify-center mb-8 shadow-2xl shadow-black/20 rounded-none">
                  {step.icon}
                </div>
                
                <span 
                  className="text-[#8E8567] text-6xl font-serif opacity-20 absolute top-0 right-1/2 translate-x-1/2 -translate-y-4 select-none"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {step.number}
                </span>

                <h3 
                  className="text-white text-2xl mb-4 relative z-20"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {step.title}
                </h3>
                
                <p 
                  className="text-gray-400 text-base font-light leading-relaxed max-w-xs mx-auto"
                  style={{ fontFamily: "'Figtree', sans-serif" }}
                >
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}