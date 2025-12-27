import { Star, ArrowLeft, ArrowRight, Quote } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Reveal } from "./animations/Reveal";
import type { Testimonial as DBTestimonial } from "../types/database";

interface TestimonialsCarouselProps {
  testimonials: DBTestimonial[];
}

export function TestimonialsCarousel({ testimonials }: TestimonialsCarouselProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(4);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Responsive items per page
  useEffect(() => {
    const updateLayout = () => {
      const width = window.innerWidth;

      if (width < 768) {
        setItemsPerPage(1);
      } else if (width < 1280) {
        setItemsPerPage(2);
      } else {
        setItemsPerPage(4); // 4 items per page on desktop as requested
      }
    };

    updateLayout();
    window.addEventListener('resize', updateLayout);
    return () => window.removeEventListener('resize', updateLayout);
  }, []);

  const totalPages = Math.ceil(testimonials.length / itemsPerPage);

  // Reset to page 0 if window resize changes total pages and we are out of bounds
  useEffect(() => {
    if (currentPage >= totalPages && totalPages > 0) {
      setCurrentPage(0);
    }
  }, [itemsPerPage, totalPages, currentPage]);

  const truncateText = (text: string, maxWords: number = 30) => {
    const words = text.trim().split(/\s+/);
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(" ") + "...";
  };

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const prevPage = () => {
    setCurrentPage((prev) => (prev === 0 ? totalPages - 1 : prev - 1));
  };

  if (!testimonials.length) return null;

  // Get current page items
  const currentTestimonials = testimonials.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  return (
    <section className="w-full bg-white py-12 md:py-20 overflow-hidden">
      <div className="w-full px-6 md:px-12 lg:px-20">
        <div className="max-w-[1600px] mx-auto">

          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-16">
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

            {/* Navigation Buttons */}
            <div className="flex gap-4 mt-8 md:mt-0">
              <Reveal delay={0.2}>
                <div className="flex gap-4">
                  <button
                    onClick={prevPage}
                    disabled={totalPages <= 1}
                    className="w-12 h-12 border border-[#1A2551]/20 rounded-full flex items-center justify-center hover:bg-[#1A2551] hover:text-white hover:border-[#1A2551] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Previous page"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextPage}
                    disabled={totalPages <= 1}
                    className="w-12 h-12 border border-[#1A2551]/20 rounded-full flex items-center justify-center hover:bg-[#1A2551] hover:text-white hover:border-[#1A2551] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Next page"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </Reveal>
            </div>
          </div>

          {/* Grid Content */}
          <div className="relative min-h-[400px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-t border-l border-[#1A2551]/10 touch-pan-y cursor-grab active:cursor-grabbing"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.1}
                onDragEnd={(e, { offset }) => {
                  const swipe = offset.x;
                  if (swipe < -50) {
                    nextPage();
                  } else if (swipe > 50) {
                    prevPage();
                  }
                }}
              >
                {currentTestimonials.map((testimonial, index) => (
                  <div
                    key={testimonial.id || index}
                    className="flex flex-col justify-between border-r border-b border-[#1A2551]/10 p-8 md:p-10 h-[450px]"
                  >
                    <div>
                      <div className="flex gap-1 mb-6">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-[#8E8567] text-[#8E8567]" />
                        ))}
                      </div>

                      <blockquote
                        className="text-[#1A2551] text-base leading-relaxed mb-8 overflow-hidden relative"
                        style={{ fontFamily: "'Figtree', sans-serif" }}
                      >
                        "{truncateText(testimonial.content, 35)}"
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

                {/* Fill empty slots to maintain grid borders if last page is incomplete */}
                {[...Array(itemsPerPage - currentTestimonials.length)].map((_, i) => (
                  <div
                    key={`empty-${i}`}
                    className="hidden lg:block border-r border-b border-[#1A2551]/10 h-[450px]"
                  />
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}