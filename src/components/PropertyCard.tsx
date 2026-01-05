/**
 * PropertyCard Component
 * Reusable property card used in Featured Properties (home) and Properties page
 * Maintains consistent layout, styling, and interactions across the site
 *
 * Features:
 * - CSS-based magnetic effect on View button
 * - Smooth hover animations with OptimizedImage lazy loading
 * - LQIP blur-up effect for premium feel
 * - Optimized for stagger animations in grids
 */

import { useRef, useState } from "react";
import { Property } from "../types/property";
import { OptimizedImage } from "./OptimizedImage";
import { Heart, Bed, Bath } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useFavorites } from "../contexts/FavoritesContext";
import { cn } from "./ui/utils";
import { PredictiveLink } from "./features/PredictiveLink";
import { trackEvent } from "../utils/analytics";
import { getPropertyStatusStyles } from "../utils/propertyUtils";

interface PropertyCardProps {
  property: Property;
  className?: string;
  /** Index for stagger animations (set automatically by parent grid) */
  index?: number;
}

export function PropertyCard({ property, className, index = 0 }: PropertyCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const isPropertyFavorite = isFavorite(property.id);
  const navigate = useNavigate();

  // Refs
  const cardRef = useRef<HTMLAnchorElement>(null);
  const viewButtonRef = useRef<HTMLDivElement>(null);

  // Magnetic effect state for View button (CSS-based)
  const [magnetOffset, setMagnetOffset] = useState({ x: 0, y: 0 });

  const handleButtonMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!viewButtonRef.current) return;

    const button = viewButtonRef.current;
    const rect = button.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = ((e.clientX - centerX) / rect.width) * 8;
    const deltaY = ((e.clientY - centerY) / rect.height) * 8;

    setMagnetOffset({ x: deltaX, y: deltaY });
  };

  const handleButtonMouseLeave = () => {
    setMagnetOffset({ x: 0, y: 0 });
  };

  // Get status badge styling
  const getStatusStyle = (status: string) => {
    return getPropertyStatusStyles(status);
  };

  const handleCardClick = () => {
    navigate(`/properties/${property.slug}`);
  };

  return (
    <PredictiveLink
      ref={cardRef}
      to={`/properties/${property.slug}`}
      imageToPreload={property.image}
      onClick={() => trackEvent('select_content', 'Property Card', property.title)}
      className={cn(
        "property-card group flex flex-col bg-white cursor-pointer h-full overflow-hidden transition-all duration-300",
        "border border-[#1A2551] rounded-xl hover:shadow-xl hover:border-[#1A2551]/30",
        className
      )}
      data-index={index}
    >
      {/* Image Container */}
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-100">
        <OptimizedImage
          alt={property.title}
          className="transition-transform duration-700 ease-out group-hover:scale-105"
          src={property.image}
          priority={index === 0}
          enableLQIP={true}
          aspectRatio="4/3"
          fetchPriority={index < 3 ? 'high' : 'auto'}
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
            {property.status === 'under_offer' || property.status === 'under-offer' ? 'Sale Agreed' : property.status.replace(/_/g, ' ')}
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

          {/* View Button - with magnetic effect */}
          <div
            ref={viewButtonRef}
            onMouseMove={handleButtonMouseMove}
            onMouseLeave={handleButtonMouseLeave}
            style={{
              transform: `translate(${magnetOffset.x}px, ${magnetOffset.y}px)`,
              transition: magnetOffset.x === 0 ? 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'transform 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
            }}
            className="px-5 py-1.5 rounded-full border border-[#1A2551]/20 text-[#1A2551] text-[10px] font-bold uppercase tracking-widest hover:bg-[#1A2551] hover:text-white transition-colors duration-300"
          >
            View
          </div>
        </div>
      </div>
    </PredictiveLink>
  );
}