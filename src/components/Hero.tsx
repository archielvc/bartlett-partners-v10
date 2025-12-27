import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { OptimizedImage } from "./OptimizedImage";
import { ImageWithFallback } from "./ui/ImageWithFallback";
import { getAllPropertiesAdmin } from "../utils/database";
import type { Property as DBProperty } from "../types/database";
import { useNavigate, Link } from "react-router-dom";
import { ChevronDown, ArrowRight } from "lucide-react";
import { useLoading } from "../contexts/LoadingContext";
import { useState, useEffect } from "react";
import { BookEvaluationDialog } from "./BookEvaluationDialog";

export function Hero() {
  const navigate = useNavigate();
  const { isLoadingComplete } = useLoading();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [featuredProperty, setFeaturedProperty] = useState<DBProperty | null>(null);
  const [slides, setSlides] = useState<any[]>([]);

  // Fetch featured property from database
  useEffect(() => {
    const fetchFeaturedProperty = async () => {
      const allProperties = await getAllPropertiesAdmin();
      // Find property with is_featured = true
      const featured = allProperties.find(p => p.is_featured);

      if (featured) {
        setFeaturedProperty(featured);

        // Build slides array with featured property
        const propertySlide = {
          type: 'property' as const,
          image: featured.hero_image || featured.thumbnail_image || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1080',
          label: 'Featured Property',
          title: featured.title,
          description: featured.description,
          location: featured.location || '',
          price: featured.price,
          duration: 10000, // 10 seconds for featured property
          ctaLink: `/properties/${featured.slug}`
        };

        setSlides([
          propertySlide,
          {
            type: 'area' as const,
            image: 'https://images.unsplash.com/photo-1737462636488-21a776e1ca89?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWRkaW5ndG9uJTIwbG9uZG9uJTIwcml2ZXJzaWRlfGVufDF8fHx8MTc2MzA0MDY2NHww&ixlib=rb-4.1.0&q=80&w=1080',
            title: 'Teddington',
            description: 'Discover the charm of riverside living in one of London\'s most desirable neighborhoods.',
            duration: 5000,
            ctaLink: '/teddington'
          },
          {
            type: 'area' as const,
            image: "https://images.unsplash.com/photo-1569335687776-f3065463b950?auto=format&fit=crop&w=2000&q=80",
            title: 'Twickenham',
            description: 'Home to rugby, history, and beautiful parks, Twickenham offers a perfect blend of city and country.',
            duration: 5000,
            ctaLink: '/twickenham'
          },
        ]);
      } else {
        // Fallback if no featured property
        setSlides([
          {
            type: 'area' as const,
            image: 'https://images.unsplash.com/photo-1737462636488-21a776e1ca89?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWRkaW5ndG9uJTIwbG9uZG9uJTIwcml2ZXJzaWRlfGVufDF8fHx8MTc2MzA0MDY2NHww&ixlib=rb-4.1.0&q=80&w=1080',
            title: 'Teddington',
            description: 'Discover the charm of riverside living in one of London’s most desirable neighborhoods.',
            duration: 5000,
          },
          {
            type: 'area' as const,
            image: 'https://images.unsplash.com/photo-1737462636488-21a776e1ca89?auto=format&fit=crop&w=1200&q=80',
            title: 'Twickenham',
            description: 'Home to rugby, history, and beautiful parks, Twickenham offers a perfect blend of city and country.',
            duration: 5000,
          },
        ]);
      }
    };

    fetchFeaturedProperty();
  }, []);

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth < 768) {
        setScrollY(0);
        return;
      }
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Preload all slide images on mount
  useEffect(() => {
    slides.forEach((slide) => {
      const img = new Image();
      img.src = slide.image;
    });
  }, [slides]);

  // Auto-rotate slides
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, slides[currentSlide]?.duration || 5000);

    return () => clearInterval(interval);
  }, [currentSlide, slides]);

  const slide = slides[currentSlide];

  // Don't render until slides are loaded
  if (!slide || slides.length === 0) {
    return <div className="relative w-full min-h-screen bg-black" />; // Loading state
  }

  // Calculate depth effect - more dramatic as scroll increases
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
  const fadeDistance = viewportHeight * 0.8; // Fade over 80% of viewport height
  const scrollProgress = Math.min(scrollY / fadeDistance, 1); // Normalize to 0-1

  // Parallax depth - image moves down and scales up creating depth
  const parallaxY = scrollY * 0.3;
  const scale = 1 + (scrollProgress * 0.15); // Scale up by 15% max for depth effect

  // Fade out all hero content uniformly as scroll increases - synced with navigation
  const contentOpacity = Math.max(0, Math.min(1, 1 - scrollProgress)); // Clamp between 0 and 1

  return (
    <section
      id="hero-section"
      className="relative top-0 w-full min-h-screen overflow-hidden bg-black"
      style={{
        perspective: '1200px',
        perspectiveOrigin: 'center top',
        height: '100dvh',
      }}
    >
      {/* Background Image with Parallax Depth Effect */}
      <AnimatePresence initial={false}>
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.6,
            ease: "easeInOut"
          }}
          className="absolute inset-0 w-full h-full"
          style={{
            transform: `translateY(${parallaxY}px) scale(${scale})`,
            willChange: window.scrollY > 0 && window.scrollY < 1000 ? "transform" : "auto",
            transformOrigin: 'center center',
          }}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
            loading="eager"
            style={{
              objectPosition: 'center center',
              minWidth: '100%',
              minHeight: '100%',
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Gradient Overlay - Darker for text readability, fades to darker as you scroll */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(to bottom, rgba(0,0,0,${0.5 + scrollProgress * 0.2}) 0%, rgba(0,0,0,${0.2 + scrollProgress * 0.3}) 40%, rgba(0,0,0,${0.4 + scrollProgress * 0.3}) 100%),
            radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,${0.3 + scrollProgress * 0.2}) 80%)
          `
        }}
      />

      {/* Top Section - Two Column Layout for Mobile */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: contentOpacity, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{
            duration: 0.6,
            ease: "easeInOut"
          }}
          className="absolute inset-0 flex flex-col justify-end md:justify-center pb-24 md:pb-0 px-6 md:px-12 lg:px-20 z-50 pointer-events-none"
        >
          <div className="grid grid-cols-1 gap-4 pointer-events-auto">
            {/* Left Column - Content - Takes up half screen on desktop */}
            <div className="min-w-0 max-w-full md:max-w-[80vw] lg:max-w-[50vw]" style={{ hyphens: 'none', wordBreak: 'normal' }}>
              {slide.type === 'property' && (
                <>
                  {slide.label && (
                    <div className="inline-block mb-6 px-4 py-2 border border-white/30 backdrop-blur-md bg-black/10 text-white text-[10px] uppercase tracking-[0.2em] font-medium">
                      {slide.label}
                    </div>
                  )}

                  <h2
                    className="text-white mb-4 leading-[1.1]"
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "clamp(2.5rem, 5vw, 4rem)",
                      fontWeight: 400,
                      hyphens: 'none',
                      wordBreak: 'normal',
                      overflowWrap: 'break-word'
                    }}
                  >
                    {slide.title}
                  </h2>

                  {slide.description && (
                    <p
                      className="text-white/90 text-base md:text-lg font-light mb-8 max-w-xl leading-relaxed line-clamp-3 md:line-clamp-4"
                      style={{ fontFamily: "'Figtree', sans-serif" }}
                    >
                      {slide.description}
                    </p>
                  )}

                  <div className="mt-2">
                    <Button
                      variant="hero"
                      asChild
                      className="flex items-center justify-center gap-4 md:gap-2 group"
                    >
                      <Link to={slide.ctaLink || '/properties'}>
                        View Property
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                  </div>
                </>
              )}

              {slide.type === 'area' && (
                <>
                  <div className="inline-block mb-6 px-4 py-2 border border-white/30 backdrop-blur-md bg-black/10 text-white text-[10px] uppercase tracking-[0.2em] font-medium">
                    Area Guide
                  </div>

                  <h1
                    className="text-white mb-4 leading-[1.1]"
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "clamp(2.5rem, 5vw, 4rem)",
                      fontWeight: 400,
                      hyphens: 'none',
                      wordBreak: 'normal',
                      overflowWrap: 'break-word'
                    }}
                  >
                    {slide.title}
                  </h1>

                  {slide.description && (
                    <p
                      className="text-white/90 text-base md:text-lg font-light mb-8 max-w-xl leading-relaxed line-clamp-3 md:line-clamp-4"
                      style={{ fontFamily: "'Figtree', sans-serif" }}
                    >
                      {slide.description}
                    </p>
                  )}

                  <div className="mt-2">
                    <Button
                      variant="hero"
                      asChild
                      className="flex items-center justify-center gap-4 md:gap-2 group"
                    >
                      <Link to={slide.ctaLink || '/properties'}>
                        Explore Area
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}