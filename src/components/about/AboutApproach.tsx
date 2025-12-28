import { motion } from "motion/react";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";

import { trackCTAClick } from "../../utils/analytics";

export function AboutApproach() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <section ref={containerRef} className="relative w-full bg-[#1A2551] text-white py-32">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-20">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-32">

          {/* Sticky Left Column */}
          <div className="lg:w-5/12 h-fit lg:sticky lg:top-32 relative">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-[#8E8567] text-sm uppercase tracking-[0.2em] font-bold mb-6 block">
                The Journey
              </span>
              <h2
                className="text-5xl md:text-6xl lg:text-7xl mb-8 leading-[0.9] font-light"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Your <br /> Journey
              </h2>
              <p className="text-white/60 text-lg font-light leading-relaxed max-w-md mb-12">
                Our proven five-step approach ensures every property receives a tailored marketing plan designed to achieve the best possible outcome.
              </p>

              <div className="w-full h-[1px] bg-white/10 mb-12" />

              <div className="hidden lg:block mt-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <Button
                    variant="ghost"
                    premium
                    size="lg"
                    className="bg-white border border-[#1A2551] text-[#1A2551] transition-colors px-8 py-6 text-base w-full justify-center rounded-md"
                    asChild
                  >
                    <Link to="/contact" onClick={() => trackCTAClick('Start your journey', 'About Approach')}>
                      <span className="premium-hover !inline-flex items-center justify-center gap-2 font-bold uppercase tracking-wider text-sm">
                        Book Valuation
                      </span>
                    </Link>
                  </Button>
                </motion.div>
              </div>

            </motion.div>
          </div>

          {/* Scrollable Right Column */}
          <div className="lg:w-7/12 space-y-32 lg:pt-20">
            {[
              { title: "Strategise", desc: "We begin with a detailed consultation at your home. Understanding your timescales, motivations and property allows us to create a tailored marketing plan rather than a one-size-fits-all approach." },
              { title: "Expose", desc: "Your property is photographed, filmed and described to the highest standard. We launch across all major portals, our social channels and our private buyer network simultaneously." },
              { title: "Launch", desc: "The first two weeks are critical. We create momentum with a focused launch campaign, generating maximum interest while your property is new to market." },
              { title: "Leverage", desc: "As offers arrive, we leverage buyer interest strategically. Our negotiation expertise, honed over 30 years, ensures you achieve the best possible price and terms." },
              { title: "Secure", desc: "From offer to completion, we manage every detail. Solicitor liaison, survey coordination, chain management. We handle the complexities so you do not have to." }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20%" }}
                transition={{ duration: 0.8 }}
                className="group"
              >
                <div className="flex flex-col gap-4">
                  <span
                    className="text-[#8E8567]/30 text-base italic lowercase transition-colors duration-300 group-hover:text-[#8E8567]/50"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    0{index + 1}
                  </span>
                  <h3
                    className="text-3xl md:text-4xl text-white group-hover:text-[#8E8567] transition-colors duration-300"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {item.title}
                  </h3>
                </div>
                <p className="text-white/60 text-xl font-light leading-relaxed border-l border-white/10 pl-6 group-hover:border-[#8E8567] transition-colors duration-300 mt-6">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>

        </div>
      </div >
    </section >
  );
}