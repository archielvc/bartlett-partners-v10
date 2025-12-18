import { useState, useEffect, useRef } from "react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import whiteLogo from "figma:asset/a49a304c14bdb50701e6c3c6ec4ac8419c70162c.png";

export function WhoWeAreScrollSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const containerHeight = containerRef.current.offsetHeight;
      const viewportHeight = window.innerHeight;

      // Calculate when section enters viewport
      const scrollStart = -rect.top;
      const scrollEnd = containerHeight - viewportHeight;

      if (scrollStart < 0 || scrollEnd <= 0) {
        // Before section enters or invalid scroll range
        setScrollProgress(0);
      } else if (scrollStart > scrollEnd) {
        // After section exits
        setScrollProgress(1);
      } else {
        // During scroll through section
        const progress = scrollStart / scrollEnd;
        setScrollProgress(Math.min(Math.max(progress, 0), 1));
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial call

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Luxury easing function - ease-out-quart for smooth deceleration
  const easeOutQuart = (t: number): number => {
    return 1 - Math.pow(1 - t, 4);
  };

  // Luxury easing function - ease-out-cubic for text (slightly less dramatic)
  const easeOutCubic = (t: number): number => {
    return 1 - Math.pow(1 - t, 3);
  };

  // Animation stages based on scroll progress
  // 0 - 0.4: Image expands from rectangle to fullscreen (slower, more luxurious)
  // 0.4 - 0.6: "Who we are" text slides in from left
  // 0.6 - 0.8: "What we do" text slides in from right
  // 0.8 - 1.0: Hold the state while next section overlaps

  const imageExpandProgress = easeOutQuart(Math.min(scrollProgress / 0.4, 1));
  const whoWeAreProgress = easeOutCubic(Math.min(Math.max((scrollProgress - 0.4) / 0.2, 0), 1));
  const whatWeDoProgress = easeOutCubic(Math.min(Math.max((scrollProgress - 0.6) / 0.2, 0), 1));

  // Image scale and position - NO ZOOM, just expand to full viewport
  const imageWidth = 60 + imageExpandProgress * 40; // Width from 60% to 100%
  const imageHeight = 60 + imageExpandProgress * 40; // Height from 60% to 100%

  // Text slide positions (luxury smooth easing)
  const whoWeAreX = -100 + whoWeAreProgress * 100; // Slide from -100% to 0%
  const whatWeDoX = 100 - whatWeDoProgress * 100; // Slide from 100% to 0%

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-white"
      style={{
        height: "300vh", // 3x viewport height for scroll duration
      }}
    >
      {/* Sticky container that pins content during scroll */}
      <div
        className="sticky top-0 w-full h-screen overflow-hidden bg-white"
        style={{
          isolation: "isolate",
        }}
      >
        {/* Image - starts as rectangle, expands to fullscreen */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            zIndex: 1,
          }}
        >
          <div
            className="relative"
            style={{
              width: `${imageWidth}%`,
              height: `${imageHeight}%`,
              transition: "none",
            }}
          >
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw3fHxsdXh1cnklMjBwcm9wZXJ0eSUyMGludGVyaW9yfGVufDB8fHx8MTczMTQ1NjI4Mnww&ixlib=rb-4.0.3&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Luxury property interior"
              className="w-full h-full object-cover"
            />
            {/* Dark overlay tint */}
            <div 
              className="absolute inset-0 bg-black/40"
              style={{
                transition: "none",
              }}
            />
          </div>
        </div>

        {/* Bartlett Logo - Center of screen */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            zIndex: 2,
            pointerEvents: "none",
          }}
        >
          <img
            src={whiteLogo}
            alt="Bartlett & Partners"
            style={{
              height: "clamp(4rem, 8vw, 6rem)",
              width: "auto",
              opacity: 0.9,
            }}
          />
        </div>

        {/* "Who We Are" Text - Top Left Quarter */}
        <div
          className="absolute top-0 left-0 flex items-start justify-start p-16 md:p-20"
          style={{
            zIndex: 3,
            opacity: whoWeAreProgress,
            transform: `translateX(${whoWeAreX}%)`,
            pointerEvents: whoWeAreProgress > 0 ? "auto" : "none",
            width: "fit-content",
            maxWidth: "none",
          }}
        >
          <div className="space-y-3">
            <p
              className="text-white/90"
              style={{
                fontFamily: "'Figtree', sans-serif",
                fontSize: "1.125rem",
                lineHeight: "1.7",
                maxWidth: "500px",
              }}
            >
              Founded on the principle that exceptional properties deserve exceptional representation, we bring decades of combined expertise to the Richmond property market.
            </p>
          </div>
        </div>

        {/* "What We Do" Text - Bottom Right Quarter */}
        <div
          className="absolute bottom-0 right-0 flex items-end justify-end p-16 md:p-20"
          style={{
            zIndex: 3,
            opacity: whatWeDoProgress,
            transform: `translateX(${whatWeDoX}%)`,
            pointerEvents: whatWeDoProgress > 0 ? "auto" : "none",
            width: "fit-content",
            maxWidth: "none",
          }}
        >
          <div className="space-y-3 text-left">
            <p
              className="text-white/90"
              style={{
                fontFamily: "'Figtree', sans-serif",
                fontSize: "1.125rem",
                lineHeight: "1.7",
                maxWidth: "500px",
              }}
            >
              Our approach is simple: provide discerning clients with unparalleled service, market insight, and access to the finest properties in the region.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}