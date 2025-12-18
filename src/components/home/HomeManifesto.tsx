import { motion } from "motion/react";

const manifestoItems = [
  {
    title: "Tailored Strategies",
    description: "Every property is unique. We design bespoke marketing strategies that align perfectly with your property's character and your personal goals."
  },
  {
    title: "Market Intelligence",
    description: "We don't just track the market; we anticipate it. Our data-driven approach ensures you're always positioned ahead of the curve."
  },
  {
    title: "Global Reach",
    description: "Connecting your property with qualified buyers from around the world through our exclusive network and premium digital presence."
  },
  {
    title: "Personal Attention",
    description: "A dedicated partner for your journey. We manage every detail, from staging to negotiation, ensuring a seamless experience."
  }
];

export function HomeManifesto() {
  return (
    <section className="w-full bg-white px-6 md:px-12 lg:px-20 py-24 md:py-32">
      <div className="max-w-[1600px] mx-auto">
        <div className="mb-24 lg:mb-32 max-w-4xl">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-[#1A2551] text-4xl md:text-5xl lg:text-7xl leading-[1.1]"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
          >
            We believe that in a world where properties have become numbers, a personal approach is key to ensure you get the most out of your home.
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
          {manifestoItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
            >
              <h3
                className="text-[#1A2551] text-lg font-bold mb-4"
                style={{ fontFamily: "'Figtree', sans-serif" }}
              >
                {item.title}
              </h3>
              <p
                className="text-[#1A2551]/70 text-sm leading-relaxed"
                style={{ fontFamily: "'Figtree', sans-serif" }}
              >
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
