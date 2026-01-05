import { useState, useEffect } from 'react';
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { getHomeFeaturedProperties } from "../../utils/database";
import type { Property } from "../../types/property";
import { PropertyCard } from "../PropertyCard";
import { FeaturedPropertiesSkeleton } from "../ui/skeletons";
import { motion } from "motion/react";

export function HomeFeaturedProperties() {
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      setIsLoading(true);
      const properties = await getHomeFeaturedProperties();
      setFeaturedProperties(properties);
      setIsLoading(false);
    };
    fetchProperties();
  }, []);

  // Show skeleton while loading
  if (isLoading) {
    return (
      <section className="w-full bg-[#F5F3EE] px-6 md:px-12 lg:px-20 py-20 md:py-32">
        <div className="max-w-[1600px] mx-auto">
          <FeaturedPropertiesSkeleton />
        </div>
      </section>
    );
  }

  if (!featuredProperties.length) return null;

  return (
    <section className="w-full bg-[#F5F3EE] px-6 md:px-12 lg:px-20 py-20 md:py-32">
      <div className="max-w-[1600px] mx-auto">

        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 md:mb-16 gap-6 md:gap-0">
          <div className="flex flex-col items-start gap-2">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6 }}
              className="text-[#8E8567] text-sm tracking-[0.2em] font-bold uppercase"
              style={{ fontFamily: "'Figtree', sans-serif" }}
            >
              Exclusive Portfolio
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-[#1A2551] text-5xl md:text-6xl"
              style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
            >
              Featured Properties
            </motion.h2>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Link
              to="/properties"
              className="flex items-center gap-2 text-[#1A2551] hover:text-[#8E8567] transition-colors group mb-2"
            >
              <span className="text-sm font-medium tracking-widest uppercase border-b border-[#1A2551] group-hover:border-[#8E8567] pb-1 transition-colors" style={{ fontFamily: "'Figtree', sans-serif" }}>
                View all properties
              </span>
              <ArrowRight className="w-4 h-4 mb-1" />
            </Link>
          </motion.div>
        </div>

        {/* Desktop Grid / Mobile Carousel Wrapper */}
        <div className="relative">
          {/* Grid Layout - 3 Cols on Large Screens, Scroll on Mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {featuredProperties.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.1,
                  ease: [0.25, 0.1, 0.25, 1]
                }}
                className={index === 2 ? "md:hidden lg:block" : ""}
              >
                <PropertyCard
                  property={property}
                  index={index}
                />
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
