import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { OptimizedImage } from "./OptimizedImage";
import { useSiteSettings } from "../contexts/SiteContext";

export function ExploreBoroughs() {
  const navigate = useNavigate();
  const { images } = useSiteSettings();

  return (
    <section className="w-full bg-white px-6 md:px-12 lg:px-20 py-12 md:py-20 overflow-hidden">
      <div className="max-w-[1600px] mx-auto">
        <div className="mb-8 md:mb-12 text-center">
          <span className="block text-[#8E8567] text-sm tracking-[0.2em] uppercase mb-4 font-bold" style={{ fontFamily: "'Figtree', sans-serif" }}>
            Unrivaled Local Insight
          </span>
          <h2
            className="text-[#1A2551] text-3xl md:text-4xl lg:text-5xl break-words"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
          >
            Explore Our Neighbourhoods
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Twickenham */}
          <Link
            to="/twickenham"
            className="group relative aspect-[4/3] cursor-pointer overflow-hidden rounded-md block"
          >
            <OptimizedImage
              src={images.locations.l_twickenham}
              alt="Luxury Homes in Twickenham"
              className="transition-transform duration-700 lg:group-hover:scale-105"
              aspectRatio="4/3"
              enableLQIP={true}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-opacity lg:group-hover:opacity-90" />

            <div className="absolute bottom-0 left-0 w-full p-6 md:p-8 lg:p-12">
              <h3
                className="text-white text-2xl md:text-3xl lg:text-4xl mb-4"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Living in Twickenham
              </h3>
              <div className="flex items-center gap-4 text-white/80 lg:group-hover:text-white transition-colors">
                <span className="text-sm font-medium uppercase tracking-widest font-sans">
                  Explore Area
                </span>
                <ArrowRight className="w-5 h-5 transition-transform duration-300 lg:group-hover:translate-x-1" />
              </div>
            </div>
          </Link>

          {/* Teddington */}
          <Link
            to="/teddington"
            className="group relative aspect-[4/3] cursor-pointer overflow-hidden rounded-md block"
          >
            <OptimizedImage
              src={images.locations.l_teddington}
              alt="Luxury Homes in Teddington"
              className="transition-transform duration-700 lg:group-hover:scale-105"
              aspectRatio="4/3"
              enableLQIP={true}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-opacity lg:group-hover:opacity-90" />

            <div className="absolute bottom-0 left-0 w-full p-6 md:p-8 lg:p-12">
              <h3
                className="text-white text-2xl md:text-3xl lg:text-4xl mb-4"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Living in Teddington
              </h3>
              <div className="flex items-center gap-4 text-white/80 lg:group-hover:text-white transition-colors">
                <span className="text-sm font-medium uppercase tracking-widest font-sans">
                  Explore Area
                </span>
                <ArrowRight className="w-5 h-5 transition-transform duration-300 lg:group-hover:translate-x-1" />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}