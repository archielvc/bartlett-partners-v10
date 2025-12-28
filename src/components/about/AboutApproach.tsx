import { motion, useScroll, useTransform, useSpring, useInView } from "motion/react";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";

import { trackCTAClick } from "../../utils/analytics";

export function AboutApproach() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const opacity = useSpring(useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]), {
    stiffness: 100,
    damping: 30
  });

  const scale = useSpring(useTransform(scrollYProgress, [0, 0.2], [0.95, 1]), {
    stiffness: 100,
    damping: 30
  });

  return (
    <section ref={containerRef} className="relative w-full bg-[#1A2551] text-white py-32 overflow-visible">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-20">
        <div className="flex flex-col lg:flex-row items-start gap-16 lg:gap-32">

          {/* Sticky Left Column */}
          <div className="lg:w-5/12 lg:sticky lg:top-32 self-start z-10">
            <motion.div
              style={{ opacity, scale }}
              className="relative"
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
              <ApproachItem key={index} item={item} index={index} />
            ))}
          </div>

        </div>
      </div >
    </section >
  );
}

function ApproachItem({ item, index }: { item: { title: string, desc: string }, index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: "-20% 0px -20% 0px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="group"
    >
      <div className="flex flex-col gap-4">
        <motion.span
          className="text-base italic lowercase transition-colors duration-500"
          style={{ fontFamily: "'Playfair Display', serif" }}
          animate={{
            color: isInView ? "#8E8567" : "rgba(142, 133, 103, 0.3)",
            scale: isInView ? 1.1 : 1,
            x: isInView ? 10 : 0
          }}
        >
          0{index + 1}
        </motion.span>
        <h3
          className="text-3xl md:text-4xl transition-colors duration-300"
          style={{
            fontFamily: "'Playfair Display', serif",
            color: isInView ? "#8E8567" : "white"
          }}
        >
          {item.title}
        </h3>
      </div>
      <motion.p
        animate={{
          borderColor: isInView ? "#8E8567" : "rgba(255, 255, 255, 0.1)",
          color: isInView ? "rgba(255, 255, 255, 0.9)" : "rgba(255, 255, 255, 0.6)"
        }}
        className="text-xl font-light leading-relaxed border-l pl-6 transition-colors duration-500 mt-6"
      >
        {item.desc}
      </motion.p>
    </motion.div>
  )
}