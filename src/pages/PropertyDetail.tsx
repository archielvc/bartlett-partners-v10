
import { ImageWithFallback } from "../components/ui/ImageWithFallback";
import { PropertyInquiryDialog } from "../components/PropertyInquiryDialog";
import { BookEvaluationDialog } from "../components/BookEvaluationDialog";
import { PropertyCard } from "../components/PropertyCard";
import { Button } from "../components/ui/button";
import { Reveal } from "../components/animations/Reveal";
import {
    Bed,
    Bath,
    Maximize,
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    X,
    Calendar,
    Download,
    Camera
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
// import { useFavorites } from "../contexts/FavoritesContext"; // Unused in this file according to linter rules usually, but user included it. I'll keep it if they used it, but they didn't seem to use it in the snippet provided (except import). 
// Actually, looking at the code: "const { slug } = useParams<{ slug: string }>();" - useFavorites is imported but NOT USED in the user snippet. I will remove it to be clean, or keep it to be safe. I'll keep it commented or remove it if unused.
import { motion, AnimatePresence } from "motion/react";
import { updateSEO, injectSchema, SchemaGenerator } from "../utils/seo";
import type { PropertyWithDetails, Testimonial } from "../types/database";
import type { Property as UIProperty } from "../types/property";
import { trackPropertyView } from '../utils/analytics';
import { useScrollDepth } from '../hooks/useScrollDepth';

// Database imports
import {
    getPropertyBySlug,
    getPublishedProperties,
    getPublishedTestimonials
} from "../utils/database";

export default function PropertyDetail() {
    useScrollDepth();
    const [galleryOpen, setGalleryOpen] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
    const [property, setProperty] = useState<PropertyWithDetails | null>(null);
    const [relatedProperties, setRelatedProperties] = useState<UIProperty[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const { slug } = useParams<{ slug: string }>();

    // Convert Google Maps URL to embed URL
    const convertToEmbedUrl = (url: string): string => {
        if (!url) return '';
        try {
            if (url.includes('/place/')) {
                const placeMatch = url.match(/\/place\/([^/@]+)/);
                if (placeMatch) {
                    const place = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
                    return `https://maps.google.com/maps?q=${encodeURIComponent(place)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
                }
            }
            if (url.includes('query=')) {
                const queryMatch = url.match(/query=([^&]+)/);
                if (queryMatch) {
                    const query = decodeURIComponent(queryMatch[1]);
                    return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
                }
            }
            const coordMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
            if (coordMatch) {
                return `https://maps.google.com/maps?q=${coordMatch[1]},${coordMatch[2]}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
            }
            if (property?.full_address || property?.postcode) {
                const addr = `${property.full_address || ''} ${property.postcode || ''}`.trim();
                return `https://maps.google.com/maps?q=${encodeURIComponent(addr)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
            }
            return '';
        } catch (e) {
            console.warn('Map URL conversion error:', e);
            return '';
        }
    };

    const getImageAlt = (index: number) => {
        const galleryLength = (property?.gallery_images || []).filter(Boolean).length;
        if (property && index < galleryLength) {
            return property.gallery_images_alt?.[index] || `Interior photo ${index + 1} of ${property.title}`;
        }
        return property?.hero_image_alt || "";
    };

    useEffect(() => {
        if (galleryOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [galleryOpen]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            if (!slug) {
                setIsLoading(false);
                return;
            }

            try {
                const propData = await getPropertyBySlug(slug);

                if (propData) {
                    setProperty(propData);

                    const priceVal = parseFloat(propData.price.replace(/[^0-9.]/g, '')) || 0;
                    trackPropertyView(String(propData.id), propData.title, priceVal);

                    updateSEO({
                        title: propData.meta_title || `${propData.title} - Bartlett & Partners`,
                        description: propData.meta_description || `${propData.beds} bed ${propData.property_type?.toLowerCase()} for sale in ${propData.location}.`,
                        ogImage: propData.hero_image || '',
                        type: 'product',
                        keywords: ['luxury property', propData.location || '', propData.property_type || '']
                    });

                    injectSchema(SchemaGenerator.realEstateListing({
                        title: propData.title,
                        description: propData.description || '',
                        image: propData.hero_image || '',
                        price: propData.price,
                        address: propData.location || '',
                        beds: propData.beds || 0
                    }));

                    const [allProps, allTestimonials] = await Promise.all([
                        getPublishedProperties(),
                        getPublishedTestimonials()
                    ]);

                    const related = allProps.filter(p => p.id !== propData.id).slice(0, 3);
                    setRelatedProperties(related);
                    setTestimonials(allTestimonials);
                }
            } catch (error) {
                console.error('Error fetching property:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [slug]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1A2551] mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading property...</p>
                </div>
            </div>
        );
    }

    if (!property) {
        setTimeout(() => navigate('/properties'), 2000);
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
                <div className="text-center">
                    <h1 className="text-2xl font-semibold text-gray-900 mb-2">Property Not Found</h1>
                    <p className="text-gray-600 mb-4">Redirecting...</p>
                </div>
            </div>
        );
    }

    const displayImages = (property.gallery_images || []).filter(Boolean);
    if (displayImages.length === 0 && property.hero_image) displayImages.push(property.hero_image);
    if (displayImages.length === 0 && property.thumbnail_image) displayImages.push(property.thumbnail_image);

    const priceValue = parseFloat(property.price.replace(/[^0-9.]/g, '')) || 0;
    const formattedPrice = `£${priceValue.toLocaleString()}`;

    // Helper for sqft display
    const sqftDisplay = property.sqft ? `${property.sqft.toLocaleString()} sq ft` : null;

    return (
        <main id="main-content" className="w-full bg-[#FDFBF7] pt-24 md:pt-32 pb-20">

            {/* 1. Image Grid Section */}
            <section className="px-4 md:px-8 lg:px-12 xl:px-20 mb-12">
                <div className="max-w-[1600px] mx-auto">
                    {/* Back Button */}
                    <button
                        onClick={() => navigate('/properties')}
                        className="flex items-center gap-2 text-[#1A2551] mb-6 hover:opacity-70 transition-opacity group cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-semibold text-xs uppercase tracking-widest" style={{ fontFamily: "'Figtree', sans-serif" }}>
                            Back to Properties
                        </span>
                    </button>

                    {/* Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-auto md:h-[70vh] min-h-[500px]">
                        {/* Main Large Image */}
                        <div
                            className="relative h-full md:col-span-2 rounded-lg overflow-hidden cursor-pointer group"
                            onClick={() => {
                                setGalleryOpen(true);
                                setSelectedImageIndex(0);
                            }}
                        >
                            <ImageWithFallback
                                src={displayImages[0]}
                                alt={getImageAlt(0)}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />

                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                        </div>

                        {/* Right Side Grid */}
                        <div className="grid md:col-span-1 w-full h-full grid-cols-2 grid-rows-2 gap-4">
                            {displayImages.slice(1, 5).map((img, idx) => (
                                <div
                                    key={idx}
                                    className="relative rounded-lg overflow-hidden cursor-pointer group"
                                    onClick={() => {
                                        setGalleryOpen(true);
                                        setSelectedImageIndex(idx + 1);
                                    }}
                                >
                                    <ImageWithFallback
                                        src={img}
                                        alt={getImageAlt(idx + 1)}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                    {/* "View all photos" on the last item */}
                                    {idx === 3 && (
                                        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white backdrop-blur-[2px] transition-colors hover:bg-black/50">
                                            <Camera className="w-6 h-6 mb-2" />
                                            <span className="text-sm font-medium" style={{ fontFamily: "'Figtree', sans-serif" }}>View all photos</span>
                                        </div>
                                    )}
                                    {idx !== 3 && <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />}
                                </div>
                            ))}
                            {/* Fallbacks if not enough images */}
                            {displayImages.length < 5 && Array.from({ length: 5 - displayImages.length }).slice(0, 4 - Math.max(0, displayImages.length - 1)).map((_, i) => (
                                <div key={`placeholder-${i}`} className="bg-[#EBE9E4] rounded-lg flex items-center justify-center opacity-50">
                                    <Camera className="w-8 h-8 text-[#1A2551]/30" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. Main Content Layout */}
            <section className="px-4 md:px-8 lg:px-12 xl:px-20">
                <div className="max-w-[1600px] mx-auto">
                    <div className="flex flex-col lg:flex-row gap-16 relative">

                        {/* LEFT COLUMN (Content) */}
                        <div className="w-full lg:w-2/3">
                            {/* Title */}
                            <h1
                                className="text-[#1A2551] text-4xl md:text-5xl lg:text-6xl mb-6"
                                style={{ fontFamily: "'Playfair Display', serif" }}
                            >
                                {property.title}
                            </h1>

                            {/* Stats */}
                            <div className="flex items-center gap-8 mb-8 pb-8 border-b border-[#1A2551]/10">
                                <div className="flex items-center gap-2 text-[#1A2551]">
                                    <Bed className="w-5 h-5 stroke-[1.5]" />
                                    <span className="text-lg" style={{ fontFamily: "'Figtree', sans-serif" }}>{property.beds} bed</span>
                                </div>
                                <div className="flex items-center gap-2 text-[#1A2551]">
                                    <Bath className="w-5 h-5 stroke-[1.5]" />
                                    <span className="text-lg" style={{ fontFamily: "'Figtree', sans-serif" }}>{property.baths} bath</span>
                                </div>
                                {sqftDisplay && (
                                    <div className="flex items-center gap-2 text-[#1A2551]">
                                        <Maximize className="w-4 h-4 stroke-[1.5]" />
                                        <span className="text-lg" style={{ fontFamily: "'Figtree', sans-serif" }}>{sqftDisplay}</span>
                                    </div>
                                )}
                            </div>

                            {/* About this home */}
                            <div className="mb-12">
                                <h2 className="text-[#1A2551] text-2xl mb-4 font-semibold" style={{ fontFamily: "'Figtree', sans-serif" }}>About this home</h2>
                                <div
                                    className="text-[#3A3A3A] leading-relaxed space-y-4 font-light text-base md:text-lg"
                                    style={{ fontFamily: "'Figtree', sans-serif" }}
                                >
                                    {property.description?.split('\n').map((paragraph, i) => (
                                        <p key={i}>{paragraph}</p>
                                    ))}
                                </div>
                            </div>

                            {/* Key Features */}
                            <div className="mb-12">
                                <h2 className="text-[#1A2551] text-2xl mb-6 font-semibold" style={{ fontFamily: "'Figtree', sans-serif" }}>Key Features</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                                    {(() => {
                                        const defaultFeatures = [
                                            "Bespoke Kitchen Design",
                                            "Underfloor Heating",
                                            "Smart Home Technology",
                                            "Landscaped Gardens",
                                            "Private Parking",
                                            "Concierge Service"
                                        ];
                                        const featuresToShow = [...(property.features || []), ...defaultFeatures].slice(0, 6);

                                        return featuresToShow.map((feature, idx) => (
                                            <div key={idx} className="flex items-center gap-3 py-2 border-b border-[#1A2551]/5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#8E8567] shrink-0" />
                                                <span className="text-[#3A3A3A] font-light text-base" style={{ fontFamily: "'Figtree', sans-serif" }}>{feature}</span>
                                            </div>
                                        ));
                                    })()}
                                </div>
                            </div>

                            {/* Location & Floor Plan */}
                            {(property.google_maps_url || property.floor_plan_image) && (
                                <div className="mb-12">
                                    <h2 className="text-[#1A2551] text-2xl mb-6 font-semibold" style={{ fontFamily: "'Figtree', sans-serif" }}>Location & Floor Plan</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* Map */}
                                        {property.google_maps_url ? (
                                            <div className="w-full aspect-square bg-gray-100 rounded-xl overflow-hidden relative border border-[#1A2551]/10">
                                                <iframe
                                                    width="100%"
                                                    height="100%"
                                                    frameBorder="0"
                                                    style={{ border: 0, filter: 'grayscale(1) opacity(0.8)' }}
                                                    src={convertToEmbedUrl(property.google_maps_url)}
                                                    aria-label="Property Location"
                                                ></iframe>
                                                <div className="absolute inset-0 pointer-events-none border border-[#1A2551]/10 rounded-xl" />
                                            </div>
                                        ) : (
                                            <div className="w-full aspect-square bg-gray-50 flex items-center justify-center rounded-xl border border-[#1A2551]/10">
                                                <span className="text-gray-400">Map unavailable</span>
                                            </div>
                                        )}

                                        {/* Floor Plan */}
                                        <div
                                            className="w-full aspect-square bg-white rounded-xl overflow-hidden relative border border-[#1A2551]/10 flex items-center justify-center cursor-pointer group p-8"
                                            onClick={() => property.floor_plan_image && window.open(property.floor_plan_image, '_blank')}
                                        >
                                            {property.floor_plan_image ? (
                                                <>
                                                    <ImageWithFallback
                                                        src={property.floor_plan_image}
                                                        alt="Floor Plan"
                                                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 opacity-90"
                                                    />
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-[#1A2551]/5 transition-colors duration-300 flex items-center justify-center">
                                                        <div className="bg-white px-5 py-3 rounded-md shadow-lg border border-[#1A2551]/10 opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0">
                                                            <span className="text-[#1A2551] text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                                                <Maximize className="w-4 h-4" /> View Large
                                                            </span>
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center text-[#1A2551]/40">
                                                    <Maximize className="w-12 h-12 mb-3 opacity-30" strokeWidth={1} />
                                                    <span className="text-sm font-medium tracking-wider uppercase">Floor plan pending</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* RIGHT COLUMN (Sticky Sidebar) */}
                        <div className="w-full lg:w-1/3 sticky top-32 h-fit z-10">
                            <Reveal width="100%" delay={0.2}>
                                <div className="space-y-6">

                                    {/* Main Action Card */}
                                    <div className="bg-white rounded-2xl border-2 border-[#1A2551] p-6 shadow-xl shadow-[#1A2551]/5">
                                        <div className="text-center mb-6">
                                            <span className="text-[#1A2551]/60 text-xs font-semibold uppercase tracking-widest block mb-2" style={{ fontFamily: "'Figtree', sans-serif" }}>Guide Price</span>
                                            <span className="text-[#1A2551] text-3xl md:text-4xl block" style={{ fontFamily: "'Playfair Display', serif" }}>
                                                {formattedPrice}
                                            </span>
                                        </div>

                                        <div className="space-y-3 mb-8">
                                            <PropertyInquiryDialog
                                                property={{
                                                    id: property.id,
                                                    title: property.title,
                                                    location: property.location || '',
                                                    price: formattedPrice,
                                                    priceValue: priceValue,
                                                    image: property.hero_image || '',
                                                    beds: property.beds || 0,
                                                    baths: property.baths || 0,
                                                    sqft: property.sqft?.toString() || '0',
                                                    type: property.property_type || '',
                                                    status: property.status as any,
                                                    slug: property.slug
                                                }}
                                                trigger={
                                                    <Button
                                                        premium
                                                        className="w-full h-12 text-white"
                                                        style={{
                                                            backgroundColor: '#1A2551',
                                                            borderColor: '#1A2551'
                                                        }}
                                                    >
                                                        Enquire
                                                    </Button>
                                                }
                                            />

                                            <BookEvaluationDialog
                                                trigger={
                                                    <Button
                                                        premium
                                                        className="w-full h-12 text-white"
                                                        style={{
                                                            backgroundColor: '#A89F81',
                                                            borderColor: '#A89F81'
                                                        }}
                                                    >
                                                        Sell with us
                                                    </Button>
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>
                            </Reveal>
                        </div>
                    </div>
                </div>
            </section >

            {/* Gallery Modal */}
            <AnimatePresence>
                {
                    galleryOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md"
                            onClick={() => setGalleryOpen(false)}
                        >
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setGalleryOpen(false);
                                }}
                                className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors"
                            >
                                <X className="w-8 h-8" />
                            </button>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedImageIndex((selectedImageIndex - 1 + displayImages.length) % displayImages.length);
                                }}
                                className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 p-2 rounded-full backdrop-blur-sm text-white transition-all hidden md:block"
                            >
                                <ChevronLeft className="w-8 h-8" />
                            </button>

                            <div className="w-full h-full p-4 md:p-20 flex items-center justify-center overflow-hidden">
                                <AnimatePresence mode="wait">
                                    <motion.img
                                        key={selectedImageIndex}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                        src={displayImages[selectedImageIndex]}
                                        alt={getImageAlt(selectedImageIndex)}
                                        className="max-w-full max-h-full object-contain shadow-2xl"
                                    />
                                </AnimatePresence>
                            </div>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedImageIndex((selectedImageIndex + 1) % displayImages.length);
                                }}
                                className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 p-2 rounded-full backdrop-blur-sm text-white transition-all hidden md:block"
                            >
                                <ChevronRight className="w-8 h-8" />
                            </button>
                        </motion.div>
                    )
                }
            </AnimatePresence >

            <section className="px-4 md:px-8 lg:px-12 xl:px-20 mt-20">
                <div className="max-w-[1600px] mx-auto">
                    <h2 className="text-[#1A2551] text-3xl mb-8" style={{ fontFamily: "'Playfair Display', serif" }}>Similar Residences</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {relatedProperties.map((prop) => (
                            <PropertyCard key={prop.id} property={prop} />
                        ))}
                    </div>
                </div>
            </section>

        </main >
    );
}
