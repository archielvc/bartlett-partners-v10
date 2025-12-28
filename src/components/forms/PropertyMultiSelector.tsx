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
                    className="absolute inset-0 z-[100] bg-white overflow-hidden flex flex-col rounded-md"
                >
                    {/* Liquid Background Elements */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
                        <div className="absolute -top-[20%] -right-[10%] w-[70vw] h-[70vw] bg-[#8E8567]/10 rounded-full blur-[100px]" />
                        <div className="absolute top-[40%] -left-[10%] w-[60vw] h-[60vw] bg-[#1A2551]/5 rounded-full blur-[80px]" />
                    </div>

                    {/* Header */}
                    <div className="px-6 md:px-12 py-6 border-b border-[#1A2551]/10 flex items-center justify-between gap-4 flex-shrink-0 bg-white/80 backdrop-blur-md z-10 sticky top-0">
                        <div className="flex-1 min-w-0">
                            <h3
                                className="text-[#1A2551] mb-1 whitespace-nowrap"
                                style={{
                                    fontFamily: "'Playfair Display', serif",
                                    fontSize: "clamp(1.5rem, 4vw, 2rem)",
                                    fontStyle: "italic",
                                    fontWeight: 400
                                }}
                            >
                                Select Properties
                            </h3>
                            <p className="text-[#1A2551]/60 text-sm font-medium uppercase tracking-wider" style={{ fontFamily: "'Figtree', sans-serif" }}>
                                {selectedProperties.length} Selected
                            </p>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                            <Button
                                type="button"
                                onClick={onClose}
                                variant="default"
                                size="sm"
                                premium
                                className="bg-[#1A2551] text-white hover:bg-[#1A2551]/90 shadow-lg px-6 md:px-8"
                            >
                                Done
                            </Button>
                        </div>
                    </div>

                    {/* Properties List */}
                    <div className="flex-1 overflow-y-auto bg-transparent custom-scrollbar p-6 md:p-12">
                        <div className="max-w-4xl mx-auto w-full">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-[#1A2551]/40 mb-3" />
                                    <span className="text-sm text-gray-500">Loading properties...</span>
                                </div>
                            ) : sortedProperties.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <MapPin className="w-10 h-10 text-gray-300 mb-3" />
                                    <span className="text-sm text-gray-500">No available properties at this time</span>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {sortedProperties.map((prop) => {
                                        const isSelected = selectedProperties.some(p => p.id === prop.id);

                                        return (
                                            <button
                                                key={prop.id}
                                                type="button"
                                                onClick={() => toggleProperty(prop)}
                                                className={`w-full p-4 flex items-start gap-4 hover:bg-white transition-all duration-300 text-left rounded-2xl border group ${isSelected
                                                    ? 'bg-white border-[#1A2551] shadow-lg ring-1 ring-[#1A2551]/10 transform scale-[1.01]'
                                                    : 'bg-white/60 border-transparent hover:border-[#1A2551]/20 hover:shadow-lg hover:-translate-y-0.5'
                                                    }`}
                                            >
                                                {/* Checkbox */}
                                                <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-300 flex-shrink-0 mt-1 ${isSelected
                                                    ? 'bg-[#1A2551] border-[#1A2551]'
                                                    : 'border-[#1A2551]/20 bg-white group-hover:border-[#1A2551]/40'
                                                    }`}>
                                                    {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                                                </div>

                                                <div className="flex flex-col gap-4 flex-1 min-w-0">
                                                    {/* Image */}
                                                    <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-gray-200 shadow-md group-hover:shadow-lg transition-all duration-300">
                                                        <ImageWithFallback
                                                            src={prop.image}
                                                            alt={prop.title}
                                                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                                                        />
                                                        {isFavorite(prop.id) && (
                                                            <div className="absolute top-2 right-2 bg-[#DC2626] rounded-full p-1.5 shadow-sm z-10">
                                                                <Heart className="w-3 h-3 text-white fill-white" />
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Content */}
                                                    <div className="flex flex-col gap-1">
                                                        <h3
                                                            className="text-[#1A2551] transition-colors"
                                                            style={{
                                                                fontFamily: "'Playfair Display', serif",
                                                                fontSize: "1.5rem",
                                                                fontWeight: 400,
                                                                lineHeight: "1.2"
                                                            }}
                                                        >
                                                            {formatPrice(prop.price)}
                                                        </h3>
                                                        <h4
                                                            className="text-[#1A2551]/80 font-medium truncate pr-2 uppercase tracking-wide text-xs mt-1"
                                                            style={{
                                                                fontFamily: "'Figtree', sans-serif"
                                                            }}
                                                        >
                                                            {prop.title}
                                                        </h4>
                                                        <div className="flex items-center gap-1.5 text-[#1A2551]/50 mt-1">
                                                            <MapPin className="w-3.5 h-3.5" />
                                                            <span className="text-sm truncate font-medium" style={{ fontFamily: "'Figtree', sans-serif" }}>{prop.location}</span>
                                                        </div>
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
