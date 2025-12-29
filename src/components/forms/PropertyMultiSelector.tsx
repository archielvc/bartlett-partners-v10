import React, { useState, useEffect } from "react";
import { Check, Heart, MapPin, Loader2 } from "lucide-react";
import { useFavorites } from "../../contexts/FavoritesContext";
import { ImageWithFallback } from "../ui/ImageWithFallback";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "../ui/button";
import { Property } from "../../types/property";
import { getPublishedProperties } from "../../utils/database";

interface PropertyMultiSelectorProps {
    selectedProperties: Property[];
    onSelectionChange: (properties: Property[]) => void;
    showSelector: boolean;
    onClose: () => void;
}

export function PropertyMultiSelector({
    selectedProperties,
    onSelectionChange,
    showSelector,
    onClose,
}: PropertyMultiSelectorProps) {
    const { isFavorite } = useFavorites();
    const [properties, setProperties] = useState<Property[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch live properties from Supabase when selector opens
    useEffect(() => {
        if (showSelector && properties.length === 0) {
            const fetchProperties = async () => {
                setIsLoading(true);
                try {
                    const data = await getPublishedProperties();
                    // Filter for available properties
                    const available = data.filter(p =>
                        p.status?.toLowerCase() === 'available'
                    );
                    setProperties(available);
                } catch (error) {
                    console.error('Error fetching properties:', error);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchProperties();
        }
    }, [showSelector, properties.length]);

    // Sort with favorites first
    const sortedProperties = [...properties].sort((a, b) => {
        const aIsFav = isFavorite(a.id);
        const bIsFav = isFavorite(b.id);
        if (aIsFav && !bIsFav) return -1;
        if (!aIsFav && bIsFav) return 1;
        return 0;
    });

    const toggleProperty = (prop: Property) => {
        const isSelected = selectedProperties.some(p => p.id === prop.id);
        if (isSelected) {
            onSelectionChange(selectedProperties.filter(p => p.id !== prop.id));
        } else {
            onSelectionChange([...selectedProperties, prop]);
        }
    };

    const formatPrice = (price: number | string) => {
        if (typeof price === 'string') {
            if (price.includes('£')) return price;
            const num = parseFloat(price);
            if (isNaN(num)) return price;
            return new Intl.NumberFormat('en-GB', {
                style: 'currency',
                currency: 'GBP',
                maximumFractionDigits: 0,
            }).format(num);
        }
        return new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: 'GBP',
            maximumFractionDigits: 0,
        }).format(price);
    };

    return (
        <AnimatePresence>
            {showSelector && (
                <motion.div
                    initial={{ opacity: 0, y: "100%" }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: "100%" }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="absolute inset-0 z-[60] bg-white overflow-hidden flex flex-col border-2 border-[#1A2551] rounded-xl"
                >
                    {/* Header */}
                    <div className="px-5 py-4 border-b border-[#1A2551]/10 flex items-center justify-between gap-4 flex-shrink-0 bg-white z-10 sticky top-0 shadow-sm">
                        <div className="flex-1 min-w-0">
                            <h3
                                className="text-[#1A2551] mb-0.5 whitespace-nowrap"
                                style={{
                                    fontFamily: "'Playfair Display', serif",
                                    fontSize: "1.5rem",
                                    fontStyle: "italic",
                                    fontWeight: 400
                                }}
                            >
                                Select Properties
                            </h3>
                            <p className="text-[#1A2551]/60 text-xs font-medium uppercase tracking-wider" style={{ fontFamily: "'Figtree', sans-serif" }}>
                                {selectedProperties.length} Selected
                            </p>
                        </div>
                        <Button
                            type="button"
                            onClick={onClose}
                            variant="default"
                            size="sm"
                            premium
                            className="bg-[#1A2551] text-white hover:bg-[#1A2551]/90 shadow-md px-5 h-9"
                        >
                            Done
                        </Button>
                    </div>

                    {/* Properties List */}
                    <div className="flex-1 overflow-y-auto bg-transparent custom-scrollbar p-0">
                        <div className="w-full">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center py-20">
                                    <Loader2 className="w-8 h-8 animate-spin text-[#1A2551]/40 mb-3" />
                                    <span className="text-sm text-gray-500">Loading properties...</span>
                                </div>
                            ) : sortedProperties.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                                    <MapPin className="w-10 h-10 text-gray-300 mb-3" />
                                    <span className="text-sm text-gray-500">No available properties at this time</span>
                                </div>
                            ) : (
                                <div className="divide-y divide-[#1A2551]/5">
                                    {sortedProperties.map((prop) => {
                                        const isSelected = selectedProperties.some(p => p.id === prop.id);

                                        return (
                                            <button
                                                key={prop.id}
                                                type="button"
                                                onClick={() => toggleProperty(prop)}
                                                className={`w-full px-5 py-3 flex items-center gap-4 hover:bg-[#1A2551]/[0.02] transition-all duration-200 text-left group ${isSelected ? 'bg-[#1A2551]/[0.03]' : ''}`}
                                            >
                                                {/* Checkbox */}
                                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all duration-200 flex-shrink-0 ${isSelected
                                                    ? 'bg-[#1A2551] border-[#1A2551]'
                                                    : 'border-[#1A2551]/20 bg-white group-hover:border-[#1A2551]/40'
                                                    }`}>
                                                    {isSelected && <Check className="w-3 h-3 text-white" />}
                                                </div>

                                                {/* Image */}
                                                <div className="relative w-20 aspect-[4/3] rounded-md overflow-hidden bg-gray-200 shadow-sm flex-shrink-0 group-hover:shadow transition-all">
                                                    <ImageWithFallback
                                                        src={prop.image}
                                                        alt={prop.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    {isFavorite(prop.id) && (
                                                        <div className="absolute top-1 right-1 bg-[#DC2626] rounded-full p-1 shadow-sm z-10">
                                                            <Heart className="w-2 h-2 text-white fill-white" />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Content */}
                                                <div className="flex flex-col flex-1 min-w-0 py-0.5">
                                                    <div className="flex flex-col gap-0.5 mb-0.5">
                                                        <h3
                                                            className="text-[#1A2551] transition-colors whitespace-nowrap"
                                                            style={{
                                                                fontFamily: "'Playfair Display', serif",
                                                                fontSize: "1.1rem",
                                                                fontWeight: 400,
                                                                lineHeight: "1.2"
                                                            }}
                                                        >
                                                            {formatPrice(prop.price)}
                                                        </h3>
                                                        <h4
                                                            className="text-[#1A2551]/80 font-medium truncate uppercase tracking-wide text-[0.65rem]"
                                                            style={{
                                                                fontFamily: "'Figtree', sans-serif"
                                                            }}
                                                        >
                                                            {prop.title}
                                                        </h4>
                                                    </div>

                                                    <div className="flex items-center gap-1 text-[#1A2551]/50">
                                                        <MapPin className="w-3 h-3 flex-shrink-0" />
                                                        <span className="text-xs truncate font-medium" style={{ fontFamily: "'Figtree', sans-serif" }}>{prop.location}</span>
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
