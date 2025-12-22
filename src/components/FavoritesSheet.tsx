import { useFavorites } from "../contexts/FavoritesContext";
import { OptimizedImage } from "./OptimizedImage";
import { getPropertyStatusStyles } from "../utils/propertyUtils";
import { Sheet, SheetContent, SheetTitle, SheetDescription, SheetHeader } from "./ui/sheet";
import { X, Bed, Bath, Maximize, MapPin, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

import { Button } from "./ui/button";

interface FavoritesSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onInquire: () => void;
}

export function FavoritesSheet({ isOpen, onClose, onInquire }: FavoritesSheetProps) {
  const { favorites, removeFromFavorites } = useFavorites();
  const navigate = useNavigate();

  const handlePropertyClick = (slug: string) => {
    navigate(`/properties/${slug}`);
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[500px] p-0 flex flex-col bg-white/95 backdrop-blur-xl border-l-2 border-[#1A2551] [&>button]:hidden overflow-hidden shadow-2xl"
      >
        {/* Liquid Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute -top-[20%] -right-[10%] w-[70vw] h-[70vw] bg-[#8E8567]/10 rounded-full blur-[100px]" />
          <div className="absolute top-[40%] -left-[10%] w-[60vw] h-[60vw] bg-[#1A2551]/5 rounded-full blur-[80px]" />
        </div>

        {/* Header */}
        <SheetHeader className="px-8 pt-8 pb-6 border-b border-[#1A2551]/10 z-10 relative">
          <div className="flex items-start justify-between">
            <div>
              <SheetTitle
                className="text-[#1A2551] mb-1"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "2rem",
                  fontWeight: 400,
                  lineHeight: "1.1"
                }}
              >
                Saved Properties
              </SheetTitle>
              <div className="w-12 h-1 bg-[#8E8567] mt-3 mb-3 rounded-full"></div>
              <SheetDescription
                className="text-[#1A2551]/70"
                style={{
                  fontFamily: "'Figtree', sans-serif",
                  fontSize: "0.9375rem",
                  lineHeight: "1.5"
                }}
              >
                {favorites.length} {favorites.length === 1 ? 'property' : 'properties'} saved
              </SheetDescription>
            </div>

            {/* Circle X Close Button */}
            <button
              onClick={onClose}
              className="w-12 h-12 rounded-full bg-[#1A2551]/5 flex items-center justify-center hover:bg-[#1A2551] hover:text-white transition-colors flex-shrink-0 text-[#1A2551]"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </SheetHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6 z-10 relative custom-scrollbar">
          {favorites.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="w-20 h-20 rounded-full bg-[#1A2551]/5 flex items-center justify-center mb-6">
                <Heart className="w-8 h-8 text-[#1A2551]" />
              </div>
              <p
                className="text-[#1A2551] mb-3"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "1.5rem",
                  fontWeight: 400
                }}
              >
                No saved properties yet
              </p>
              <p
                className="text-[#1A2551]/70 max-w-xs mx-auto"
                style={{
                  fontFamily: "'Figtree', sans-serif",
                  fontSize: "1rem",
                  lineHeight: "1.6"
                }}
              >
                Start saving properties you love by clicking the heart icon on any property.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {favorites.map((property) => (
                <div
                  key={property.id}
                  className="group relative bg-white border border-[#1A2551]/10 rounded-xl overflow-hidden hover:shadow-lg hover:shadow-[#1A2551]/5 transition-all duration-300"
                >
                  {/* Remove button - positioned absolutely over the card */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromFavorites(property.id);
                    }}
                    className="absolute top-3 right-3 z-20 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#DC2626] hover:text-white text-[#1A2551]"
                    aria-label="Remove from favorites"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div
                    className="flex flex-col cursor-pointer"
                    onClick={() => handlePropertyClick(property.slug)}
                  >
                    {/* Image with status badge */}
                    <div className="w-full h-48 flex-shrink-0 overflow-hidden bg-gray-100 flex flex-col relative">
                      {/* Status badge overlay */}
                      <div className="absolute top-4 left-4 z-10 pointer-events-none">
                        <span
                          className={`px-3 py-1.5 rounded-md text-[10px] font-bold inline-block shadow-sm ${getPropertyStatusStyles(property.status)}`}
                          style={{
                            fontFamily: "'Figtree', sans-serif",
                            textTransform: "uppercase",
                            letterSpacing: "0.1em"
                          }}
                        >
                          {property.status.replace(/_/g, ' ')}
                        </span>
                      </div>

                      {/* Image fills remaining space */}
                      <div className="absolute inset-0 z-0">
                        <OptimizedImage
                          src={property.image}
                          alt={property.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      </div>
                    </div>

                    {/* Details Section */}
                    <div className="flex-1 p-6 flex flex-col">
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
                        <span
                          className="text-sm text-[#1A2551]/60 font-light tracking-wide"
                          style={{ fontFamily: "'Figtree', sans-serif" }}
                        >
                          {property.location}
                        </span>
                      </div>

                      {/* Divider */}
                      <div className="w-full h-[1px] bg-[#1A2551]/5 mb-4" />

                      {/* Bottom Row: Specs & View Button */}
                      <div className="flex items-center justify-between mt-auto">
                        {/* Specs */}
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Bed className="w-4 h-4 text-[#8E8567]" strokeWidth={1.5} />
                            <span
                              className="text-sm text-[#1A2551] font-medium"
                              style={{ fontFamily: "'Figtree', sans-serif" }}
                            >
                              {property.beds} Beds
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Bath className="w-4 h-4 text-[#8E8567]" strokeWidth={1.5} />
                            <span
                              className="text-sm text-[#1A2551] font-medium"
                              style={{ fontFamily: "'Figtree', sans-serif" }}
                            >
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
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer - Inquire Now Button */}
        {favorites.length > 0 && (
          <div className="px-8 py-6 border-t border-[#1A2551]/10 bg-white/50 backdrop-blur-md z-10">
            <Button
              onClick={() => {
                onClose();
                onInquire();
              }}
              className="w-full shadow-lg shadow-[#1A2551]/20 py-6"
              premium
            >
              Enquire Now
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}