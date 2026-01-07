import { motion } from "motion/react";

export function AboutStoryWithStats() {
  const stats = [
    { label: "Success Rate", value: "93%", sub: "Industry average is 37%." },
    { label: "Client Cap", value: "10", sub: "Maximum clients at any time ensuring dedicated attention" },
    { label: "Total Property Sold", value: "£450M+", sub: "£550k to £5M+ properties" },
  ];

  return (
    <section className="w-full bg-white">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-20">
        {/* Stats Bar - White background, blue text */}
        <div className="bg-white">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#1A2551]/10">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.6 }}
                className="py-8 px-6 lg:py-10 lg:px-8 text-center group hover:bg-[#1A2551]/5 transition-colors duration-500"
              >
                <div
                  className="text-4xl lg:text-5xl mb-3 font-light tracking-tight leading-none text-[#1A2551]"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {stat.value}
                </div>
                <div className="text-[#8E8567] text-xs uppercase tracking-[0.2em] font-bold mb-2">
                  {stat.label}
                </div>
                <p className="text-[#1A2551]/50 text-xs font-light hidden lg:block max-w-xs mx-auto">
                  {stat.sub}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
