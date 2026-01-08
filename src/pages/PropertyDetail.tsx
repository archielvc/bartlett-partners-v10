
import { ImageWithFallback } from "../components/ui/ImageWithFallback";
import { PropertyInquiryDialog } from "../components/PropertyInquiryDialog";
import { useFavorites } from "../contexts/FavoritesContext";
import { PropertyCard } from "../components/PropertyCard";
import { Button } from "../components/ui/button";

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
    Camera,
    Heart
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { useSEO } from "../contexts/SEOContext";
import { updateSEO, injectSchema, SchemaGenerator } from "../utils/seo";
import type { PropertyWithDetails, Testimonial } from "../types/database";
import type { Property as UIProperty } from "../types/property";
import { trackPropertyView } from '../utils/analytics';
import { useScrollDepth } from '../hooks/useScrollDepth';

// Database imports
import {
    getPropertyBySlug,
    getRelatedProperties,
    getPublishedTestimonials
} from "../utils/database";

import { FloorPlanViewer } from "../components/FloorPlanViewer";
import { StickyScroll } from "../components/ui/StickyScroll";

export default function PropertyDetail() {
    useScrollDepth();
    // Refactor state to support different modal types
    const [activeModal, setActiveModal] = useState<'gallery' | 'floorplan' | 'map' | null>(null);
    const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
    const [showMobileAction, setShowMobileAction] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            setShowMobileAction(scrollY > 0);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    const [property, setProperty] = useState<PropertyWithDetails | null>(null);
    const [relatedProperties, setRelatedProperties] = useState<UIProperty[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const { slug } = useParams<{ slug: string }>();
    const { setSEOData } = useSEO();
    const { isFavorite, toggleFavorite } = useFavorites();

    const thumbnailContainerRef = useRef<HTMLDivElement>(null);
    const thumbnailsRef = useRef<(HTMLButtonElement | null)[]>([]);

    // Video aspect ratio from CMS toggle
    const isVideoPortrait = property?.video_is_portrait || false;

    useEffect(() => {
        if (selectedImageIndex !== null && thumbnailContainerRef.current && thumbnailsRef.current[selectedImageIndex]) {
            const container = thumbnailContainerRef.current;
            const thumbnail = thumbnailsRef.current[selectedImageIndex];
            if (thumbnail) {
                const scrollLeft = thumbnail.offsetLeft - (container.clientWidth / 2) + (thumbnail.clientWidth / 2);
                container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
            }
        }
    }, [selectedImageIndex, activeModal]);

    // Cleanup SEO on unmount
    useEffect(() => {
        return () => setSEOData({});
    }, [setSEOData]);

    // Convert Google Maps URL to embed URL
    const convertToEmbedUrl = (url: string, interactive: boolean = false): string => {
        if (!url) return '';
        try {
            let baseUrl = '';
            if (url.includes('/place/')) {
                const placeMatch = url.match(/\/place\/([^/@]+)/);
                if (placeMatch) {
                    const place = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
                    baseUrl = `https://maps.google.com/maps?q=${encodeURIComponent(place)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
                }
            } else if (url.includes('query=')) {
                const queryMatch = url.match(/query=([^&]+)/);
                if (queryMatch) {
                    const query = decodeURIComponent(queryMatch[1]);
                    baseUrl = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
                }
            } else {
                const coordMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
                if (coordMatch) {
                    baseUrl = `https://maps.google.com/maps?q=${coordMatch[1]},${coordMatch[2]}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
                } else if (property?.full_address || property?.postcode) {
                    const addr = `${property.full_address || ''} ${property.postcode || ''}`.trim();
                    baseUrl = `https://maps.google.com/maps?q=${encodeURIComponent(addr)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
                }
            }

            // Should be clean URL already, but ensuring no existing logic breaks
            if (!baseUrl) return '';

            // For interactive map, we might want slightly different parameters if needed, 
            // but the embed iframe usually handles interactions if not blocked by overlays.
            return baseUrl;
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

    // Check if property is available for booking viewings
    const isPropertyAvailable = (status: string) => {
        const s = status?.toLowerCase();
        return s === 'available';
    };

    // Scroll to Similar Residences section for sold/sale agreed properties
    const scrollToSimilarProperties = () => {
        const section = document.getElementById('similar-residences');
        section?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (activeModal) {
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        };
    }, [activeModal]);

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

                    const seoData = {
                        title: propData.meta_title || `${propData.title} - Bartlett & Partners`,
                        description: propData.meta_description || `${propData.beds} bed ${propData.property_type?.toLowerCase()} for sale in ${propData.location}.`,
                        ogImage: propData.hero_image || '',
                        type: 'product' as const,
                        keywords: ['luxury property', propData.location || '', propData.property_type || '']
                    };

                    // Update global SEO context (Fixes race condition)
                    setSEOData(seoData);

                    // Keep direct update as eager fallback
                    updateSEO(seoData);

                    injectSchema(SchemaGenerator.realEstateListing({
                        title: propData.title,
                        description: propData.description || '',
                        image: propData.hero_image || '',
                        price: propData.price,
                        address: propData.location || '',
                        beds: propData.beds || 0
                    }));

                    const [relatedProps, allTestimonials] = await Promise.all([
                        getRelatedProperties(propData.id, 3),
                        getPublishedTestimonials()
                    ]);

                    setRelatedProperties(relatedProps);
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

    const galleryItems = (property.gallery_images || []).filter(Boolean);
    const displayImages: string[] = [];

    // 1. Hero image is always first if it exists
    if (property.hero_image) {
        displayImages.push(property.hero_image);
    }

    // 2. Add gallery images, avoiding duplicate of hero image
    const otherImages = galleryItems.filter(img => img !== property.hero_image);
    displayImages.push(...otherImages);

    // 3. Fallback to thumbnail if still empty
    if (displayImages.length === 0 && property.thumbnail_image) {
        displayImages.push(property.thumbnail_image);
    }

    const priceValue = parseFloat(property.price.replace(/[^0-9.]/g, '')) || 0;
    const formattedPrice = `£${priceValue.toLocaleString()}`;

    // Helper for sqft display
    const sqftDisplay = property.sqft ? `${property.sqft.toLocaleString()} sq ft` : null;

    return (
        <main id="main-content" className="w-full bg-white pt-24 md:pt-32 pb-20">

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
                                setActiveModal('gallery');
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
                                        setActiveModal('gallery');
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
                    <div className="flex flex-col lg:flex-row gap-16">

                        {/* LEFT COLUMN (Content) */}
                        <div className="w-full lg:flex-1 min-w-0">
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
                                <style>{`
                                     .description-content p {
                                         margin-bottom: 1.5rem !important;
                                         display: block !important;
                                     }
                                     .description-content p:last-child {
                                         margin-bottom: 0 !important;
                                     }
                                     .description-content ul {
                                         list-style-type: disc !important;
                                         margin-bottom: 1.5rem !important;
                                         padding-left: 1.5rem !important;
                                     }
                                     .description-content ol {
                                         list-style-type: decimal !important;
                                         margin-bottom: 1.5rem !important;
                                         padding-left: 1.5rem !important;
                                     }
                                     .description-content li {
                                         margin-bottom: 0.5rem !important;
                                     }
                                 `}</style>
                                <div
                                    className="text-[#3A3A3A] leading-relaxed font-light text-base md:text-lg description-content"
                                    style={{ fontFamily: "'Figtree', sans-serif" }}
                                    dangerouslySetInnerHTML={{ __html: property.description || '' }}
                                />
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
                                <div className="mt-12">
                                    <h2 className="text-[#1A2551] text-2xl mb-6 font-semibold" style={{ fontFamily: "'Figtree', sans-serif" }}>
                                        {property.google_maps_url ? 'Location & Floor Plan' : 'Floor Plan'}
                                    </h2>
                                    <div className={`grid grid-cols-1 ${property.google_maps_url && property.floor_plan_image ? 'md:grid-cols-2' : 'md:grid-cols-1'} gap-8`}>
                                        {/* Map */}
                                        {property.google_maps_url && (
                                            <div
                                                className="w-full aspect-square bg-gray-100 rounded-xl overflow-hidden relative border border-[#1A2551]/10 cursor-pointer group"
                                                onClick={() => setActiveModal('map')}
                                            >
                                                <iframe
                                                    width="100%"
                                                    height="100%"
                                                    frameBorder="0"
                                                    style={{ border: 0, pointerEvents: 'none' }}
                                                    src={convertToEmbedUrl(property.google_maps_url)}
                                                    aria-label="Property Location"
                                                ></iframe>
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-[#1A2551]/5 transition-colors duration-300 flex items-center justify-center">
                                                    <div className="bg-white px-5 py-3 rounded-md shadow-lg border border-[#1A2551]/10 opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0">
                                                        <span className="text-[#1A2551] text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                                            <Maximize className="w-4 h-4" /> Explore Map
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Floor Plan */}
                                        {property.floor_plan_image && (
                                            <div
                                                className={`w-full ${property.google_maps_url ? 'aspect-square' : 'aspect-[16/9]'} bg-white rounded-xl overflow-hidden relative border border-[#1A2551]/10 flex items-center justify-center cursor-pointer group p-8`}
                                                onClick={() => property.floor_plan_image && setActiveModal('floorplan')}
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
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Video Section */}
                            {property.video_url && (
                                <div className="mt-12">
                                    <h2 className="text-[#1A2551] text-2xl mb-6 font-semibold" style={{ fontFamily: "'Figtree', sans-serif" }}>Video Tour</h2>
                                    {/* Grid wrapper - mirrors Location & Floor Plan layout for portrait videos */}
                                    <div className={`grid ${isVideoPortrait ? 'md:grid-cols-2' : 'grid-cols-1'} gap-8`}>
                                        <div className={`w-full bg-white rounded-xl overflow-hidden border border-[#1A2551]/10`} style={{ aspectRatio: isVideoPortrait ? '9/16' : '16/9' }}>
                                            <iframe
                                                width="100%"
                                                height="100%"
                                                src={(() => {
                                                    let url = property.video_url || '';

                                                    // Handle if user pasted full iframe code
                                                    if (url.includes('<iframe')) {
                                                        const srcMatch = url.match(/src="([^"]+)"/);
                                                        if (srcMatch) url = srcMatch[1];
                                                    }

                                                    url = url.replace(/&amp;/g, '&');

                                                    // Simple parser
                                                    let id = '';
                                                    let hash = '';

                                                    // Try to find the numeric video ID
                                                    const idMatch = url.match(/([0-9]{8,10})/);
                                                    if (idMatch) id = idMatch[1];

                                                    // Try to find the hash
                                                    if (url.includes(`/${id}/`)) {
                                                        const parts = url.split(`/${id}/`);
                                                        if (parts[1]) hash = parts[1].split(/[?&/]/)[0];
                                                    } else if (url.includes('h=')) {
                                                        const match = url.match(/h=([a-zA-Z0-9]+)/);
                                                        if (match) hash = match[1];
                                                    }

                                                    if (id) {
                                                        let embedUrl = `https://player.vimeo.com/video/${id}?`;
                                                        if (hash) embedUrl += `h=${hash}`;
                                                        return embedUrl;
                                                    }

                                                    return url.includes('player.vimeo.com') ? url : '';
                                                })()}
                                                title="Property Video Tour"
                                                frameBorder="0"
                                                style={{ border: 0 }}
                                                allow="autoplay; fullscreen; picture-in-picture"
                                                allowFullScreen
                                            ></iframe>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* RIGHT COLUMN (Sticky Sidebar) */}
                        <div className="hidden lg:block w-full lg:w-1/3 lg:self-start">
                            <StickyScroll topOffset={128} className="space-y-6">

                                {/* Main Action Card */}
                                <div className="bg-white rounded-2xl border-2 border-[#1A2551] p-6 shadow-xl shadow-[#1A2551]/5">
                                    <div className="text-center mb-6">
                                        <span className="text-[#1A2551]/60 text-xs font-semibold uppercase tracking-widest block mb-2" style={{ fontFamily: "'Figtree', sans-serif" }}>Guide Price</span>
                                        <span className="text-[#1A2551] text-3xl md:text-4xl block" style={{ fontFamily: "'Playfair Display', serif" }}>
                                            {formattedPrice}
                                        </span>
                                    </div>

                                    <div className="space-y-3 mb-8">
                                        {isPropertyAvailable(property.status) ? (
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
                                                        Book a viewing
                                                    </Button>
                                                }
                                            />
                                        ) : (
                                            <Button
                                                premium
                                                onClick={scrollToSimilarProperties}
                                                className="w-full h-12 text-white"
                                                style={{
                                                    backgroundColor: '#1A2551',
                                                    borderColor: '#1A2551'
                                                }}
                                            >
                                                View Similar Properties
                                            </Button>
                                        )}

                                        <Button
                                            premium
                                            onClick={() => toggleFavorite({
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
                                                status: property.status || '',
                                                slug: property.slug
                                            })}
                                            className={`w-full h-12 flex items-center justify-center gap-2 transition-all duration-300 ${
                                                isFavorite(property.id)
                                                    ? 'hover:opacity-90'
                                                    : 'hover:bg-[#DC2626] hover:border-[#DC2626] hover:text-white'
                                            }`}
                                            style={{
                                                backgroundColor: isFavorite(property.id) ? '#DC2626' : 'transparent',
                                                borderColor: isFavorite(property.id) ? '#DC2626' : '#1A2551',
                                                borderWidth: '2px',
                                                color: isFavorite(property.id) ? 'white' : '#1A2551'
                                            }}
                                        >
                                            <Heart className={`w-4 h-4 transition-all duration-300 ${isFavorite(property.id) ? 'fill-current' : ''}`} />
                                            {isFavorite(property.id) ? 'Saved' : 'Save Property'}
                                        </Button>
                                    </div>
                                </div>
                            </StickyScroll>
                        </div>
                    </div>
                </div>
            </section >

            {/* Modal Layer */}
            <AnimatePresence>
                {/* 1. Gallery Modal */}
                {/* 1. Gallery Modal */}
                {activeModal === 'gallery' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex flex-col bg-black/95 backdrop-blur-md overscroll-contain"
                        onClick={() => setActiveModal(null)}
                    >
                        {/* Top Bar with Close Button */}
                        <div className="absolute top-0 left-0 right-0 p-6 z-[120] flex justify-end pointer-events-none">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveModal(null);
                                }}
                                className="pointer-events-auto bg-white hover:bg-white/90 text-[#1A2551] p-3 rounded-full transition-all shadow-lg hover:scale-105"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Main Image Container */}
                        <div className="flex-1 w-full relative flex items-center justify-center overflow-hidden">
                            {/* Previous Button - Solid White High Contrast */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedImageIndex((selectedImageIndex - 1 + displayImages.length) % displayImages.length);
                                }}
                                className="absolute left-6 z-[110] bg-white hover:bg-white/90 text-[#1A2551] p-4 rounded-full transition-all shadow-lg hover:scale-105 hidden md:flex items-center justify-center cursor-pointer"
                            >
                                <ChevronLeft className="w-8 h-8" />
                            </button>

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={selectedImageIndex}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="w-full h-full p-4 md:p-20 flex items-center justify-center touch-pan-y"
                                    drag="x"
                                    dragConstraints={{ left: 0, right: 0 }}
                                    dragElastic={0.1}
                                    onDragEnd={(e, { offset }) => {
                                        const swipe = offset.x;
                                        if (swipe < -50) {
                                            setSelectedImageIndex((selectedImageIndex + 1) % displayImages.length);
                                        } else if (swipe > 50) {
                                            setSelectedImageIndex((selectedImageIndex - 1 + displayImages.length) % displayImages.length);
                                        }
                                    }}
                                // Removed onClick stopPropagation here so background clicks close modal
                                >
                                    <img
                                        src={displayImages[selectedImageIndex]}
                                        alt={getImageAlt(selectedImageIndex)}
                                        className="max-w-full max-h-full object-contain shadow-2xl select-none"
                                        draggable="false"
                                        onClick={(e) => e.stopPropagation()} // Stop propagation ONLY on the image
                                    />
                                </motion.div>
                            </AnimatePresence>

                            {/* Next Button - Solid White High Contrast */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedImageIndex((selectedImageIndex + 1) % displayImages.length);
                                }}
                                className="absolute right-6 z-[110] bg-white hover:bg-white/90 text-[#1A2551] p-4 rounded-full transition-all shadow-lg hover:scale-105 hidden md:flex items-center justify-center cursor-pointer"
                            >
                                <ChevronRight className="w-8 h-8" />
                            </button>
                        </div>

                        {/* Thumbnails Strip - Increased padding for scaling visual */}
                        <div
                            className="h-32 w-full bg-black/40 backdrop-blur-md border-t border-white/10 flex items-center z-[110]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div
                                className="w-full max-w-[1600px] mx-auto overflow-x-auto flex items-center gap-4 px-8 py-4 no-scrollbar"
                                ref={thumbnailContainerRef}
                            >
                                <style>{`
                                    .no-scrollbar::-webkit-scrollbar {
                                        display: none;
                                    }
                                    .no-scrollbar {
                                        -ms-overflow-style: none;
                                        scrollbar-width: none;
                                    }
                                `}</style>
                                {displayImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        ref={(el) => { thumbnailsRef.current[idx] = el }}
                                        onClick={() => setSelectedImageIndex(idx)}
                                        className={`flex-shrink-0 relative h-20 w-32 rounded-lg overflow-hidden transition-all duration-300 ${selectedImageIndex === idx
                                            ? 'ring-4 ring-white opacity-100 scale-105 z-10 shadow-xl'
                                            : 'opacity-50 hover:opacity-100 scale-100 hover:scale-105'
                                            }`}
                                    >
                                        <ImageWithFallback
                                            src={img}
                                            alt={`Thumbnail ${idx + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                    </motion.div>
                )}

                {/* 2. Floor Plan Modal */}
                {activeModal === 'floorplan' && property?.floor_plan_image && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 md:p-12 overscroll-contain"
                        onClick={() => setActiveModal(null)}
                        onTouchEnd={(e) => {
                            // Only close if touching the backdrop directly
                            if (e.target === e.currentTarget) {
                                setActiveModal(null);
                            }
                        }}
                    >
                        {/* Wrapper for the viewer to give it a nice frame */}
                        <div
                            className="relative w-full max-w-5xl h-full max-h-[85vh] bg-white rounded-xl overflow-hidden shadow-2xl flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                            onTouchEnd={(e) => e.stopPropagation()}
                        >
                            <div className="absolute top-2 right-2 md:top-4 md:right-4 z-50">
                                <button
                                    onClick={() => setActiveModal(null)}
                                    onTouchEnd={(e) => {
                                        e.stopPropagation();
                                        setActiveModal(null);
                                    }}
                                    className="bg-white hover:bg-[#F3F4F6] p-3 md:p-2 rounded-full transition-colors border border-gray-200 shadow-lg touch-manipulation"
                                    aria-label="Close floor plan"
                                >
                                    <X className="w-6 h-6 md:w-5 md:h-5 text-[#1A2551]" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-hidden">
                                <FloorPlanViewer
                                    src={property.floor_plan_image}
                                    alt={`Floor plan for ${property.title}`}
                                />
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* 3. Map Modal */}
                {activeModal === 'map' && property?.google_maps_url && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 md:p-12 overscroll-contain"
                        onClick={() => setActiveModal(null)}
                    >
                        <div
                            className="relative w-full max-w-5xl h-full max-h-[85vh] bg-white rounded-xl overflow-hidden shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="absolute top-4 right-4 z-50">
                                <button
                                    onClick={() => setActiveModal(null)}
                                    className="bg-white/90 hover:bg-[#F3F4F6] p-2 rounded-full transition-colors border border-gray-200 shadow-sm"
                                >
                                    <X className="w-5 h-5 text-[#1A2551]" />
                                </button>
                            </div>

                            <iframe
                                width="100%"
                                height="100%"
                                frameBorder="0"
                                style={{ border: 0 }}
                                // Use the same convert function
                                src={convertToEmbedUrl(property.google_maps_url)}
                                aria-label="Interactive Property Location"
                            ></iframe>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <section id="similar-residences" className="px-4 md:px-8 lg:px-12 xl:px-20 mt-20">
                <div className="max-w-[1600px] mx-auto">
                    <h2 className="text-[#1A2551] text-3xl mb-8" style={{ fontFamily: "'Playfair Display', serif" }}>Similar Residences</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {relatedProperties.map((prop) => (
                            <PropertyCard key={prop.id} property={prop} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Mobile Sticky Action Bar */}
            <div
                className={`fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#1A2551]/10 p-4 transition-all duration-500 lg:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.05)] ${showMobileAction ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
                    }`}
            >
                <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-col">
                        <span className="text-[#1A2551]/60 text-[10px] uppercase tracking-widest font-bold">Guide Price</span>
                        <span className="text-[#1A2551] text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>{formattedPrice}</span>
                    </div>
                    <div className="flex gap-2 flex-1 justify-end items-center">
                        <button
                            onClick={() => toggleFavorite({
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
                                status: property.status || '',
                                slug: property.slug
                            })}
                            className={`w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                                isFavorite(property.id)
                                    ? 'bg-[#DC2626] border-[#DC2626] text-white'
                                    : 'bg-white border-[#1A2551] text-[#1A2551]'
                            }`}
                            aria-label={isFavorite(property.id) ? "Remove from favorites" : "Add to favorites"}
                        >
                            <Heart className={`w-5 h-5 ${isFavorite(property.id) ? 'fill-current' : ''}`} />
                        </button>
                        {isPropertyAvailable(property.status) ? (
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
                                        className="flex-1 h-11 text-white text-xs uppercase tracking-widest px-6"
                                        style={{
                                            backgroundColor: '#1A2551',
                                            borderColor: '#1A2551'
                                        }}
                                    >
                                        Book a viewing
                                    </Button>
                                }
                            />
                        ) : (
                            <Button
                                premium
                                onClick={scrollToSimilarProperties}
                                className="flex-1 h-11 text-white text-xs uppercase tracking-widest px-6"
                                style={{
                                    backgroundColor: '#1A2551',
                                    borderColor: '#1A2551'
                                }}
                            >
                                View Similar
                            </Button>
                        )}
                    </div>
                </div>
            </div>

        </main >
    );
}
