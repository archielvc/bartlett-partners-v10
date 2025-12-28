import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { getHomeFeaturedProperties } from "../../utils/database";
import type { Property } from "../../types/property";
import { PropertyCard } from "../PropertyCard";
import { Button } from "../ui/button";
import { useScrollReveal } from "../../hooks/animations/useScrollReveal";

export function HomeFeaturedProperties() {
  const navigate = useNavigate();
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);

  const containerRef = useScrollReveal({
    selector: ".featured-property-item",
    stagger: 0.1,
    threshold: 0.2
  });

  useEffect(() => {
    const fetchProperties = async () => {
      // Use new specific fetch function
      // If no specific properties are selected, it falls back to 3 available (handled in util)
      const properties = await getHomeFeaturedProperties();
      setFeaturedProperties(properties);
    };
    fetchProperties();
  }, []);

  if (!featuredProperties.length) return null;

  return (
    <section className="w-full bg-[#F5F3EE] px-6 md:px-12 lg:px-20 py-20 md:py-32">
      <div className="max-w-[1600px] mx-auto">

        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 md:mb-16 gap-6 md:gap-0">
          <div className="flex flex-col items-start gap-2">
            <span className="text-[#8E8567] text-sm tracking-[0.2em] font-bold uppercase" style={{ fontFamily: "'Figtree', sans-serif" }}>
              Exclusive Portfolio
            </span>
            <h2
              className="text-[#1A2551] text-5xl md:text-6xl"
              style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
            >
              Featured Properties
            </h2>
          </div>

          <Link
            to="/properties"
            className="flex items-center gap-2 text-[#1A2551] hover:text-[#8E8567] transition-colors group mb-2"
          >
            <span className="text-sm font-medium tracking-widest uppercase border-b border-[#1A2551] group-hover:border-[#8E8567] pb-1 transition-colors" style={{ fontFamily: "'Figtree', sans-serif" }}>
              View all properties
            </span>
            <ArrowRight className="w-4 h-4 mb-1" />
          </Link>
        </div>

        {/* Desktop Grid / Mobile Carousel Wrapper */}
        <div className="relative">
          {/* Grid Layout - 3 Cols on Large Screens, Scroll on Mobile */}
          <div
            ref={containerRef as any}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
          >
            {featuredProperties.map((property, index) => (
              <div
                key={property.id}
                className={`featured-property-item opacity-0 ${index === 2 ? "md:hidden lg:block" : ""}`}
              >
                <PropertyCard
                  property={property}
                />
              </div>
            ))}
          </div>

          {/* Mobile Navigation Hints (Optional - could keep simple) */}
        </div>

      </div>
    </section>
  );
}
