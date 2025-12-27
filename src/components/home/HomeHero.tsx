import { motion } from "motion/react";
import { Bed, Bath } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import { getFeaturedProperty, getStored } from "../../utils/database";
import type { Property as DBProperty } from "../../types/database";
import { getOptimizedUrl } from "../OptimizedImage";

import { useSiteSettings } from "../../contexts/SiteContext";

export function HomeHero() {
  const navigate = useNavigate();
  const MotionLink = motion(Link);

  // Initialize from cache for instant loading
  const [featuredProperty, setFeaturedProperty] = useState<DBProperty | null>(() => {
    return getStored<DBProperty>('property_featured_v2');
  });

  const [isMobile, setIsMobile] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { images } = useSiteSettings();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const fetchFeaturedProperty = async () => {
      // Optimized query: fetches only 1 property instead of all
      const featured = await getFeaturedProperty();
      if (featured) {
        setFeaturedProperty(featured);
      }
    };

    fetchFeaturedProperty();
  }, []);

  const staticHeroContent = {
    headline: featuredProperty?.title || "",
    subheadline: featuredProperty?.location || "",
    price: featuredProperty
      ? `£${(typeof featuredProperty.price === 'number'
        ? featuredProperty.price
        : parseInt(featuredProperty.price.replace(/[^0-9]/g, '')) || 0
      ).toLocaleString()}`
      : "",
    location: featuredProperty ? (featuredProperty.full_address || featuredProperty.location) : "",
    specs: featuredProperty
      ? `${featuredProperty.beds} Beds | ${featuredProperty.baths} Baths`
      : ""
  };

  // Use CMS image if available, otherwise featured property or empty
  // Use property image or empty
  const rawImage = featuredProperty?.hero_image || "";
  const heroImage = getOptimizedUrl(rawImage, 2000, 85, 'webp');

  return (
    <section className="relative w-full h-screen min-h-[800px] bg-[#F5F3EE] overflow-hidden">
      <div className="absolute inset-0 w-full h-full">
        {/* Base Gradient Overlay for Text Readability - Darkened for Navbar Visibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/10 to-black/40 z-10" />

        {heroImage && (
          <motion.img
            key={featuredProperty ? featuredProperty.id : 'static-hero'}
            initial={{ scale: 1.1 }}
            animate={{ scale: isHovered ? 1.05 : 1 }}
            transition={{ duration: isMobile ? 1.0 : 1.5, ease: "easeOut" }}
            src={heroImage}
            alt={staticHeroContent.headline}
            className="w-full h-full object-cover"
            loading="eager"
          />
        )}
      </div>

      {/* Content */}
      <div className="relative z-20 w-full h-full px-6 md:px-12 lg:px-20 pt-32 pb-12 flex flex-col justify-end">
        <div className="w-full max-w-[1600px] mx-auto">

          {/* Frosted Glass Property Card */}
          <MotionLink
            to={featuredProperty ? `/properties/${featuredProperty.slug}` : "/properties"}
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: featuredProperty ? 1 : 0,
              y: featuredProperty ? 0 : 20
            }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-sm w-full bg-white border border-[#1A2551] rounded-xl overflow-hidden shadow-2xl relative cursor-pointer group hover:shadow-xl transition-all duration-300 block"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="p-6 flex flex-col gap-1 relative z-10">
              {/* Top Row: Title & Price */}
              <div className="flex justify-between items-start mb-1 gap-4">
                <h1
                  className="text-[#1A2551] text-xl font-medium leading-tight group-hover:text-[#8E8567] transition-colors duration-300"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {staticHeroContent.headline}
                </h1>
                <span className="text-[#1A2551] text-xl font-normal whitespace-nowrap" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {staticHeroContent.price}
                </span>
              </div>

              {/* Location */}
              <div className="mb-6">
                <p className="text-gray-500 text-sm font-light tracking-wide">
                  {staticHeroContent.location}
                </p>
              </div>

              {/* Divider */}
              <div className="w-full h-[1px] bg-gray-100 mb-4" />

              {/* Bottom Row: Specs & View Pill */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-[#1A2551]">
                  <div className="flex items-center gap-2">
                    <Bed className="w-4 h-4 text-[#8E8567]" />
                    <span className="text-sm font-medium" style={{ fontFamily: "'Figtree', sans-serif" }}>{featuredProperty?.beds || 3} Beds</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bath className="w-4 h-4 text-[#8E8567]" />
                    <span className="text-sm font-medium" style={{ fontFamily: "'Figtree', sans-serif" }}>{featuredProperty?.baths || 2} Baths</span>
                  </div>
                </div>

                <div className="px-5 py-1.5 rounded-full border border-[#1A2551]/20 text-[#1A2551] text-[10px] font-bold uppercase tracking-widest group-hover:bg-[#1A2551] group-hover:text-white transition-all duration-300">
                  View
                </div>
              </div>
            </div>
          </MotionLink>

        </div>
      </div>
    </section>
  );
}