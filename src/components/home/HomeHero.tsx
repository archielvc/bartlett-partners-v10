import { motion } from "motion/react";
import { Bed, Bath } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { getFeaturedProperty, getStored } from "../../utils/database";
import type { Property as DBProperty } from "../../types/database";

import { useSiteSettings } from "../../contexts/SiteContext";

const MotionLink = motion.create(Link);

export function HomeHero() {
  const navigate = useNavigate();
  // MotionLink removed from here as it caused re-renders


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
  const rawImage = featuredProperty?.hero_image || "";

  // Helper to generate optimized Supabase image URLs
  const getHeroImageUrl = (width: number, quality: number) => {
    if (!rawImage || !rawImage.includes('supabase.co')) return rawImage;
    if (!rawImage.includes('/storage/v1/object/public/')) return rawImage;
    const base = rawImage.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/');
    return `${base}?width=${width}&quality=${quality}&resize=contain`;
  };

  // Mobile-first: src is 640px for mobile, srcset provides larger variants for desktop
  // This ensures mobile downloads ~80KB instead of 175KB+
  const heroImage = getHeroImageUrl(640, 70);

  // Generate responsive srcset for larger screens
  const heroSrcSet = useMemo(() => {
    if (!rawImage || !rawImage.includes('supabase.co')) return undefined;
    if (!rawImage.includes('/storage/v1/object/public/')) return undefined;
    const base = rawImage.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/');
    return `${base}?width=640&quality=70&resize=contain 640w, ${base}?width=1024&quality=75&resize=contain 1024w, ${base}?width=1600&quality=80&resize=contain 1600w`;
  }, [rawImage]);

  return (
    <section className="relative w-full h-screen min-h-[800px] bg-[#F5F3EE] overflow-hidden">
      <div className="absolute inset-0 w-full h-full">
        {/* Base Gradient Overlay for Text Readability - Darkened for Navbar Visibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/10 to-black/40 z-10" />

        {heroImage && (
          <motion.div
            key={featuredProperty ? featuredProperty.id : 'static-hero'}
            initial={{ scale: 1.1 }}
            animate={{ scale: isHovered ? 1.05 : 1 }}
            transition={{ duration: isMobile ? 1.0 : 1.5, ease: "easeOut" }}
            className="w-full h-full"
          >
            <img
              src={heroImage}
              srcSet={heroSrcSet}
              sizes="100vw"
              alt={staticHeroContent.headline}
              className="w-full h-full object-cover"
              loading="eager"
              fetchPriority="high"
              decoding="async"
              width={1920}
              height={1080}
            />
          </motion.div>
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

                <div className="px-5 py-1.5 rounded-full border border-[#1A2551]/20 text-[#1A2551] text-[10px] font-bold uppercase tracking-widest hover:bg-[#1A2551] hover:text-white transition-all duration-300">
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