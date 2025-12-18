import { Pencil, Heart } from "lucide-react";
import { properties } from "../data/properties";
import { useFavorites } from "../contexts/FavoritesContext";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { motion, AnimatePresence } from "motion/react";

interface Property {
  id: number;
  title: string;
  location: string;
  price: string;
  type?: string;
  status?: string;
  image?: string;
}

interface PropertySelectorProps {
  selectedProperty: Property | null;
  onPropertySelect: (property: Property) => void;
  showSelector: boolean;
  onToggleSelector: (show: boolean) => void;
  isOverlay?: boolean; // For dialog overlay mode
}

export function PropertySelector({ 
  selectedProperty, 
  onPropertySelect, 
  showSelector, 
  onToggleSelector,
  isOverlay = false 
}: PropertySelectorProps) {
  const { isFavorite } = useFavorites();

  // Filter to only show available properties, then sort with favorites first
  const availableProperties = properties.filter(p => p.status === "Available");
  const sortedProperties = [...availableProperties].sort((a, b) => {
    const aIsFav = isFavorite(a.id);
    const bIsFav = isFavorite(b.id);
    if (aIsFav && !bIsFav) return -1;
    if (!aIsFav && bIsFav) return 1;
    return 0;
  });

  const PropertyDisplay = () => (
    <div className="bg-[#F9FAFB] border border-gray-200 rounded-lg p-4 relative">
      <button
        type="button"
        onClick={() => onToggleSelector(true)}
        className="absolute top-3 right-3 p-2 text-[#1A2551] hover:bg-white rounded-lg transition-colors"
        aria-label="Change property"
      >
        <Pencil className="w-4 h-4" />
      </button>
      <div className="mb-1">
        <span 
          className="text-[#6B7280]"
          style={{ 
            fontFamily: "'Figtree', sans-serif",
            fontSize: "0.75rem",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            fontWeight: 600
          }}
        >
          Property
        </span>
      </div>
      <h3 
        className="text-[#1A2551] mb-1 pr-8"
        style={{ 
          fontFamily: "'Playfair Display', serif",
          fontSize: "1.25rem",
          fontWeight: 400,
          lineHeight: "1.3"
        }}
      >
        {selectedProperty ? selectedProperty.title : "No property selected"}
      </h3>
      <p 
        className="text-[#6B7280]"
        style={{ 
          fontFamily: "'Figtree', sans-serif",
          fontSize: "0.875rem"
        }}
      >
        {selectedProperty ? `${selectedProperty.location} • ${selectedProperty.price}` : "Click to select a property"}
      </p>
    </div>
  );

  const PropertyList = () => (
    <div className={`${isOverlay ? 'absolute inset-0 z-50' : ''} bg-white rounded-lg border border-gray-200 shadow-xl`}>
      <div className="h-full flex flex-col">
        <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between flex-shrink-0 bg-white">
          <span 
            className="text-[#1A2551]"
            style={{ 
              fontFamily: "'Figtree', sans-serif",
              fontSize: "0.875rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em"
            }}
          >
            Select a property
          </span>
          <button
            type="button"
            onClick={() => onToggleSelector(false)}
            className="text-[#6B7280] hover:text-[#1A2551] transition-all duration-200"
            style={{ 
              fontFamily: "'Figtree', sans-serif",
              fontSize: "0.875rem",
              fontWeight: 500
            }}
          >
            Cancel
          </button>
        </div>
        <div className="flex-1 overflow-y-auto bg-white custom-scrollbar">
          {sortedProperties.map((prop, index) => {
            const propData = properties.find(p => p.id === prop.id);
            if (!propData) return null;
            
            return (
              <motion.button
                key={prop.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ 
                  duration: 0.3,
                  delay: index * 0.04,
                  ease: [0.4, 0, 0.2, 1]
                }}
                type="button"
                onClick={() => {
                  onPropertySelect(prop);
                  onToggleSelector(false);
                }}
                className={`w-full px-6 py-4 flex items-start gap-4 hover:bg-[#F9FAFB] transition-all duration-200 text-left border-b border-gray-100 last:border-b-0 ${
                  selectedProperty?.id === prop.id ? 'bg-[#F0F4FF]' : ''
                }`}
              >
                <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
                  <ImageWithFallback
                    src={propData.image}
                    alt={prop.title}
                    className="w-full h-full object-cover"
                  />
                  {isFavorite(prop.id) && (
                    <div className="absolute top-1.5 right-1.5 bg-[#DC2626] rounded-full p-1.5">
                      <Heart className="w-3.5 h-3.5 text-white fill-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <h4 
                    className="text-[#1A2551] mb-1.5"
                    style={{ 
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "1.125rem",
                      fontWeight: 400,
                      lineHeight: "1.3"
                    }}
                  >
                    {prop.title}
                  </h4>
                  <p 
                    className="text-[#6B7280] mb-1.5"
                    style={{ 
                      fontFamily: "'Figtree', sans-serif",
                      fontSize: "0.875rem"
                    }}
                  >
                    {prop.location}
                  </p>
                  <p 
                    className="text-[#1A2551]"
                    style={{ 
                      fontFamily: "'Figtree', sans-serif",
                      fontSize: "0.9375rem",
                      fontWeight: 600
                    }}
                  >
                    {prop.price}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );

  if (isOverlay) {
    return (
      <>
        <PropertyDisplay />
        <AnimatePresence>
          {showSelector && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ 
                duration: 0.35,
                ease: [0.4, 0, 0.2, 1]
              }}
            >
              <PropertyList />
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  return showSelector ? <PropertyList /> : <PropertyDisplay />;
}
