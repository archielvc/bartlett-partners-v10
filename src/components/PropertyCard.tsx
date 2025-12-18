/**
 * PropertyCard Component
 * Reusable property card used in Featured Properties (home) and Properties page
 * Maintains consistent layout, styling, and interactions across the site
 */

import { Property } from "../types/property";
import { motion } from "motion/react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Heart, Bed, Bath, Square, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useFavorites } from "../contexts/FavoritesContext";
import { cn } from "./ui/utils";
import { PredictiveLink } from "./features/PredictiveLink";
import { trackEvent } from "../utils/analytics";
import { getPropertyStatusStyles } from "../utils/propertyUtils";

interface PropertyCardProps {
  property: Property;
  className?: string;
}

export function PropertyCard({ property, className }: PropertyCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const isPropertyFavorite = isFavorite(property.id);
  const navigate = useNavigate();

  // Get status badge styling
  const getStatusStyle = (status: string) => {
    return getPropertyStatusStyles(status);
  };

  const handleCardClick = () => {
    navigate(`/properties/${property.slug}`);
  };

  return (
    <PredictiveLink
      to={`/properties/${property.slug}`}
      imageToPreload={property.image}
      onClick={() => trackEvent('select_content', 'Property Card', property.title)}
      className={cn(
        "group flex flex-col bg-white cursor-pointer h-full overflow-hidden transition-all duration-300",
        "border border-[#1A2551] rounded-xl hover:shadow-xl hover:border-[#1A2551]/30",
        className
      )}
    >
      {/* Image Container */}
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-100">
        {/* Image fills container */}
        <ImageWithFallback
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-700 ease-out lg:group-hover:scale-105"
          src={property.image}
          loading="lazy"
        />

        {/* Dark overlay on hover - Desktop only */}
        <div className="absolute inset-0 bg-black/0 lg:group-hover:bg-black/10 transition-colors duration-300" />

        {/* Status badge - top left */}
        <div className="absolute top-4 left-4 z-10">
          <span
            className={`h-8 px-3 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center justify-center ${getStatusStyle(property.status)}`}
            style={{
              fontFamily: "'Figtree', sans-serif",
            }}
          >
            {property.status.replace(/_/g, ' ')}
          </span>
        </div>

        {/* Favorite Heart Button - top right */}
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleFavorite(property);
            }}
            className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-all duration-300 hover:scale-110 ${isPropertyFavorite
              ? 'bg-[#DC2626] text-white'
              : 'bg-white text-[#1A2551] hover:bg-[#DC2626] hover:text-white'
              }`}
            aria-label={isPropertyFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart
              className={`w-4 h-4 transition-all duration-300 ${isPropertyFavorite ? 'fill-current' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-col flex-grow p-6">
        {/* Top Row: Title & Price */}
        <div className="flex justify-between items-start mb-1 gap-4">
          <h4
            className="text-[#1A2551] text-xl font-medium line-clamp-2 group-hover:text-[#8E8567] transition-colors duration-300"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {property.title}
          </h4>
          <span
            className="text-[#1A2551] text-xl font-normal whitespace-nowrap"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {property.price}
          </span>
        </div>

        {/* Location */}
        <div className="mb-6">
          <span className="text-sm text-gray-500 font-light tracking-wide" style={{ fontFamily: "'Figtree', sans-serif" }}>
            {property.location}
          </span>
        </div>

        {/* Divider */}
        <div className="w-full h-[1px] bg-gray-100 mb-4" />

        {/* Bottom Row: Specs & View Button */}
        <div className="flex items-center justify-between mt-auto">
          {/* Specs */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Bed className="w-4 h-4 text-[#8E8567]" strokeWidth={1.5} />
              <span className="text-sm text-[#1A2551] font-medium" style={{ fontFamily: "'Figtree', sans-serif" }}>
                {property.beds} Beds
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Bath className="w-4 h-4 text-[#8E8567]" strokeWidth={1.5} />
              <span className="text-sm text-[#1A2551] font-medium" style={{ fontFamily: "'Figtree', sans-serif" }}>
                {property.baths} Baths
              </span>
            </div>
          </div>

          {/* View Button */}
          <div className="px-5 py-1.5 rounded-full border border-[#1A2551]/20 text-[#1A2551] text-[10px] font-bold uppercase tracking-widest hover:bg-[#1A2551] hover:text-white transition-all duration-300">
            View
          </div>
        </div>
      </div>
    </PredictiveLink>
  );
}