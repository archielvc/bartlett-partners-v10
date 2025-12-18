import { Star, ArrowLeft, ArrowRight, Quote } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Reveal } from "./animations/Reveal";
import type { Testimonial as DBTestimonial } from "../types/database";

interface TestimonialsCarouselProps {
  testimonials: DBTestimonial[];
}

export function TestimonialsCarousel({ testimonials }: TestimonialsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsToShow, setCardsToShow] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Responsive cards to show
  useEffect(() => {
    const updateLayout = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);

      if (width < 768) {
        setCardsToShow(1);
      } else if (width < 1280) {
        setCardsToShow(2);
      } else {
        setCardsToShow(3);
      }
    };

    updateLayout();
    window.addEventListener('resize', updateLayout);
    return () => window.removeEventListener('resize', updateLayout);
  }, []);

  const maxIndex = Math.max(0, testimonials.length - cardsToShow);

  const truncateText = (text: string, maxWords: number = 40) => {
    const words = text.trim().split(/\s+/);
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(" ") + "...";
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => {
      if (prev >= maxIndex) return 0;
      return Math.min(prev + cardsToShow, maxIndex);
    });
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => {
      if (prev <= 0) return maxIndex;
      return Math.max(prev - cardsToShow, 0);
    });
  };

  if (!testimonials.length) return null;

  return (
    <section className="w-full bg-white py-12 md:py-20 overflow-hidden">
      {/* CSS for hiding scrollbar on mobile */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>

      <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-20">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 md:mb-20">
          <div className="max-w-2xl">
            <Reveal width="100%">
              <span className="block text-[#8E8567] text-sm tracking-widest uppercase mb-4 font-medium">
                Client Experiences
              </span>
            </Reveal>
            <Reveal width="100%" delay={0.1}>
              <h2
                className="text-[#1A2551] text-4xl md:text-5xl leading-tight"
                style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
              >
                Stories of Success
              </h2>
            </Reveal>
          </div>

          {/* Navigation Buttons - Hidden on Mobile (Swipe/Scroll instead) */}
          <div className="hidden md:flex gap-4 mt-8 md:mt-0">
            <Reveal delay={0.2}>
              <div className="flex gap-4">
                <button
                  onClick={prevSlide}
                  className="w-12 h-12 border border-[#1A2551]/20 rounded-full flex items-center justify-center hover:bg-[#1A2551] hover:text-white hover:border-[#1A2551] transition-all duration-300"
                  aria-label="Previous testimonial"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextSlide}
                  className="w-12 h-12 border border-[#1A2551]/20 rounded-full flex items-center justify-center hover:bg-[#1A2551] hover:text-white hover:border-[#1A2551] transition-all duration-300"
                  aria-label="Next testimonial"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </Reveal>
          </div>
        </div>

        {/* Carousel Track */}
        <div className="relative">
          {isMobile ? (
            // Mobile: Native Scroll Snap with hidden scrollbar
            <div
              ref={scrollContainerRef}
              className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-8 -mx-6 px-6 scrollbar-hide touch-pan-x"
              style={{
                scrollBehavior: 'smooth',
                WebkitOverflowScrolling: 'touch' // Critical for smooth momentum scrolling on iOS
              }}
            >
              {testimonials.map((testimonial, index) => (
                <div
                  key={testimonial.id || index}
                  className="flex-shrink-0 w-[85vw] snap-center flex flex-col justify-between border-l border-[#1A2551]/10 pl-6 py-4"
                >
                  <div>
                    <div className="flex gap-1 mb-6">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-[#8E8567] text-[#8E8567]" />
                      ))}
                    </div>

                    <blockquote
                      className="text-[#1A2551] text-base leading-relaxed mb-8 h-[200px] overflow-hidden"
                      style={{ fontFamily: "'Figtree', sans-serif" }}
                    >
                      "{truncateText(testimonial.content)}"
                    </blockquote>
                  </div>

                  <div className="mt-auto">
                    <cite className="not-italic">
                      <span
                        className="block text-[#1A2551] text-sm font-bold tracking-wide uppercase mb-1"
                        style={{ fontFamily: "'Figtree', sans-serif" }}
                      >
                        {testimonial.author}
                      </span>
                      <span
                        className="block text-[#1A2551]/60 text-xs tracking-wide"
                        style={{ fontFamily: "'Figtree', sans-serif" }}
                      >
                        {testimonial.role}
                      </span>
                    </cite>
                  </div>
                </div>
              ))}

              {/* Spacer at the end to allow scrolling the last item fully into view */}
              <div className="w-6 flex-shrink-0" />
            </div>
          ) : (
            // Desktop: Framer Motion Drag
            <motion.div
              className="flex gap-8 md:gap-12 cursor-grab active:cursor-grabbing"
              initial={false}
              animate={{ x: `calc(-${currentIndex} * ((100% + 3rem) / ${cardsToShow}))` }} // 3rem = 48px gap
              transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.1}
              onDragEnd={(e, { offset }) => {
                const swipe = offset.x;
                if (swipe < -50) {
                  nextSlide();
                } else if (swipe > 50) {
                  prevSlide();
                }
              }}
            >
              {testimonials.map((testimonial, index) => {
                const widthPercent = 100 / cardsToShow;

                return (
                  <motion.div
                    key={testimonial.id || index}
                    className="flex-shrink-0 flex flex-col justify-between border-l border-[#1A2551]/10 pl-8 py-4"
                    style={{
                      width: `calc(${widthPercent}% - ${cardsToShow === 3 ? '2rem' : '1.5rem'})`
                    }}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.5, delay: (index % 3) * 0.1 }}
                  >
                    <div>
                      <div className="flex gap-1 mb-8">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 fill-[#8E8567] text-[#8E8567]" />
                        ))}
                      </div>

                      <blockquote
                        className="text-[#1A2551] text-base md:text-lg leading-relaxed mb-10 h-[220px] overflow-hidden"
                        style={{ fontFamily: "'Figtree', sans-serif" }}
                      >
                        "{truncateText(testimonial.content)}"
                      </blockquote>
                    </div>

                    <div className="mt-auto">
                      <cite className="not-italic">
                        <span
                          className="block text-[#1A2551] text-sm font-bold tracking-wide uppercase mb-1"
                          style={{ fontFamily: "'Figtree', sans-serif" }}
                        >
                          {testimonial.author}
                        </span>
                        <span
                          className="block text-[#1A2551]/60 text-xs tracking-wide"
                          style={{ fontFamily: "'Figtree', sans-serif" }}
                        >
                          {testimonial.role}
                        </span>
                      </cite>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}