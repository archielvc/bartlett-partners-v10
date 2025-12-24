import { motion } from "motion/react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSiteSettings } from "../../contexts/SiteContext";
import { ImageWithFallback } from "../ui/ImageWithFallback";
import { cn } from "../ui/utils";

export function HomeLocations() {
  const navigate = useNavigate();
  const { images } = useSiteSettings();

  return (
    <section className="w-full bg-[#F5F3EE] px-6 md:px-12 lg:px-20 py-20 md:py-32">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-12 md:mb-16 gap-3">
          <span className="text-[#8E8567] text-sm tracking-[0.2em] font-medium uppercase" style={{ fontFamily: "'Figtree', sans-serif" }}>
            Unrivaled Local Insight
          </span>
          <h2
            className="text-[#1A2551] text-5xl md:text-6xl"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
          >
            Explore Our Neighbourhoods
          </h2>
        </div>

        {/* 2 Column Grid for Main Locations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 h-auto lg:h-[600px]">

          {/* Left Column: Twickenham */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative w-full h-[500px] lg:h-full rounded-xl overflow-hidden cursor-pointer group shadow-sm z-0"
            onClick={() => navigate('/twickenham')}
          >
            <ImageWithFallback
              src={images.locations.l_twickenham}
              alt="Twickenham"
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A2551]/80 via-transparent to-transparent opacity-90" />

            {/* Content - Bottom Left */}
            <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full">
              <h3 className="text-white text-4xl md:text-5xl font-normal leading-tight mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                Living in Twickenham
              </h3>
              <div className="flex items-center gap-2 text-white/80 group-hover:text-[#8E8567] transition-colors duration-300">
                <span className="text-sm font-medium tracking-widest uppercase" style={{ fontFamily: "'Figtree', sans-serif" }}>
                  Explore Area
                </span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" />
              </div>
            </div>
          </motion.div>

          {/* Right Column: Teddington */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative w-full h-[500px] lg:h-full rounded-xl overflow-hidden cursor-pointer group shadow-sm z-0"
            onClick={() => navigate('/teddington')}
          >
            <ImageWithFallback
              src={images.locations.l_teddington}
              alt="Teddington"
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A2551]/80 via-transparent to-transparent opacity-90" />

            {/* Content - Bottom Left */}
            <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full">
              <h3 className="text-white text-4xl md:text-5xl font-normal leading-tight mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                Living in Teddington
              </h3>
              <div className="flex items-center gap-2 text-white/80 group-hover:text-[#8E8567] transition-colors duration-300">
                <span className="text-sm font-medium tracking-widest uppercase" style={{ fontFamily: "'Figtree', sans-serif" }}>
                  Explore Area
                </span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" />
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
