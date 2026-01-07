import { motion } from "motion/react";

export function AboutStats() {
  const stats = [
    { label: "Success Rate", value: "93%", sub: "Industry average is 37%." },
    { label: "Client Cap", value: "10", sub: "Maximum clients at any time ensuring dedicated attention" },
    { label: "Total property sold", value: "£450M+", sub: "£550k to £5M+ properties" },
  ];

  return (
    <section className="w-full bg-[#1A2551] py-16 text-white overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-20">

        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10 border-y border-white/10">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
              className="py-12 md:px-12 flex flex-col items-center text-center group hover:bg-white/5 transition-colors duration-500"
            >
              <div
                className="text-5xl md:text-6xl mb-6 font-light tracking-tight leading-none"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {stat.value}
              </div>
              <div className="text-[#8E8567] text-xs md:text-sm uppercase tracking-[0.2em] font-bold mb-4">
                {stat.label}
              </div>
              <p className="text-white/60 text-sm font-light max-w-xs mx-auto leading-relaxed">
                {stat.sub}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}