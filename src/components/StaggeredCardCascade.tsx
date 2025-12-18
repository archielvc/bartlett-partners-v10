import { useState, useEffect, useRef } from "react";

export function StaggeredCardCascade() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const containerHeight = containerRef.current.offsetHeight;
      const viewportHeight = window.innerHeight;

      if (rect.top <= 0 && rect.bottom >= viewportHeight) {
        const scrollStart = -rect.top;
        const scrollEnd = containerHeight - viewportHeight;
        
        if (scrollStart <= 0) {
          setScrollProgress(0);
        } else if (scrollStart >= scrollEnd) {
          setScrollProgress(1);
        } else {
          const progress = scrollStart / scrollEnd;
          setScrollProgress(Math.min(Math.max(progress, 0), 1));
        }
      } else if (rect.top > 0) {
        setScrollProgress(0);
      } else {
        setScrollProgress(1);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const steps = [
    {
      number: 1,
      heading: "Discovery & Understanding",
      body: "We begin by deeply understanding your unique objectives, timeline, and vision to create a tailored approach.",
    },
    {
      number: 2,
      heading: "Market Analysis",
      body: "Comprehensive market research and competitive analysis inform every strategic decision we make.",
    },
    {
      number: 3,
      heading: "Strategic Positioning",
      body: "We craft a distinctive narrative that positions your property to attract the right audience.",
    },
    {
      number: 4,
      heading: "Curated Marketing",
      body: "Sophisticated campaigns across select channels ensure maximum impact with discerning buyers.",
    },
    {
      number: 5,
      heading: "Expert Negotiation",
      body: "Our seasoned team secures optimal terms while maintaining the integrity of the transaction.",
    },
    {
      number: 6,
      heading: "Seamless Execution",
      body: "Meticulous attention to detail ensures a smooth, stress-free process from offer to close.",
    },
  ];

  // Calculate transform for each card based on scroll
  const getCardTransform = (index: number) => {
    const totalSteps = steps.length;
    const progressPerCard = 1 / totalSteps;
    const cardStartProgress = index * progressPerCard;
    const cardEndProgress = (index + 1) * progressPerCard;
    
    if (scrollProgress < cardStartProgress) {
      // Card hasn't started animating yet - offset to staggered position
      const staggerOffset = (index % 2 === 0) ? -200 : 200;
      return {
        opacity: 0.3,
        translateX: staggerOffset,
        translateY: index * 60,
      };
    } else if (scrollProgress >= cardEndProgress) {
      // Card is fully aligned
      return {
        opacity: 1,
        translateX: 0,
        translateY: 0,
      };
    } else {
      // Card is animating
      const cardProgress = (scrollProgress - cardStartProgress) / progressPerCard;
      const easeProgress = cardProgress; // Linear for now, could add easing
      const staggerOffset = (index % 2 === 0) ? -200 : 200;
      
      return {
        opacity: 0.3 + (easeProgress * 0.7),
        translateX: staggerOffset * (1 - easeProgress),
        translateY: (index * 60) * (1 - easeProgress),
      };
    }
  };

  return (
    <section
      ref={containerRef}
      className="relative w-full bg-[#F7F7F7] px-8 md:px-16 lg:px-24 py-32 md:py-40"
      style={{
        minHeight: "300vh",
      }}
    >
      {/* Title */}
      <div className="max-w-[1400px] mx-auto mb-24">
        <h2
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(2.5rem, 5vw, 4rem)",
            fontWeight: 400,
            lineHeight: "1.2",
            color: "#1A2551",
            letterSpacing: "-0.02em",
          }}
        >
          How We Do It
        </h2>
      </div>

      {/* Sticky Container */}
      <div className="sticky top-24 pb-24">
        <div className="max-w-[1400px] mx-auto space-y-8">
          {steps.map((step, index) => {
            const transform = getCardTransform(index);
            
            return (
              <div
                key={step.number}
                className="bg-white rounded-lg shadow-lg p-12 md:p-16"
                style={{
                  opacity: transform.opacity,
                  transform: `translateX(${transform.translateX}px) translateY(${transform.translateY}px)`,
                  transition: "none",
                }}
              >
                <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-start">
                  {/* Number */}
                  <div
                    className="flex-shrink-0"
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "clamp(4rem, 8vw, 6rem)",
                      fontWeight: 400,
                      color: "#1A2551",
                      lineHeight: "1",
                    }}
                  >
                    {step.number}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 pt-2">
                    <h3
                      className="mb-4"
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: "clamp(1.75rem, 3vw, 2.25rem)",
                        fontWeight: 400,
                        lineHeight: "1.3",
                        color: "#1A2551",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {step.heading}
                    </h3>
                    <p
                      style={{
                        fontFamily: "'Figtree', sans-serif",
                        fontSize: "1.125rem",
                        fontWeight: 400,
                        lineHeight: "1.7",
                        color: "#4A5568",
                      }}
                    >
                      {step.body}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
