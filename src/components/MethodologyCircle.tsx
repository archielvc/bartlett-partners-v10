import { useState, useEffect, useRef } from "react";

export function MethodologyCircle() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const containerHeight = containerRef.current.offsetHeight;
      const viewportHeight = window.innerHeight;

      // Only start animation when section is fully in viewport
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

  // 6 methodology steps
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

  // Circle properties
  const circleRadius = 350;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const strokeWidth = 24;

  // 7 checkpoints total: 0 (How We Do It) + 6 steps
  const totalCheckpoints = 7;
  
  // Calculate which checkpoint we're at (0-6)
  const getCurrentCheckpoint = () => {
    // "How We Do It" only shows at the very beginning
    if (scrollProgress < 0.05) return 0;
    
    // Otherwise, calculate which step (1-6) based on scroll progress
    const stepProgress = (scrollProgress - 0.05) / 0.95; // Normalize remaining progress
    const checkpoint = Math.floor(stepProgress * steps.length) + 1;
    return Math.min(checkpoint, steps.length);
  };

  const currentCheckpoint = getCurrentCheckpoint();

  // Circle drawing progress is SMOOTH and continuous (directly controlled by scroll)
  const circleDrawProgress = scrollProgress;
  const circleStrokeDashoffset = circleCircumference * (1 - circleDrawProgress);

  // Calculate if each number should be visible based on SMOOTH scroll progress
  // Number appears when circle reaches that exact position
  const isNumberVisible = (stepIndex: number) => {
    const progressPerStep = 1 / steps.length;
    const stepProgress = (stepIndex + 1) * progressPerStep;
    return scrollProgress >= stepProgress;
  };

  // Number positions around circle (starting from top, going clockwise)
  const getNumberPosition = (index: number) => {
    const anglePerStep = 360 / steps.length;
    const angle = index * anglePerStep; // 0°, 60°, 120°, 180°, 240°, 300°
    const radians = (angle - 90) * (Math.PI / 180); // -90 to start from top
    
    const centerX = circleRadius + 50;
    const centerY = circleRadius + 50;
    const x = centerX + circleRadius * Math.cos(radians);
    const y = centerY + circleRadius * Math.sin(radians);
    
    return { x, y };
  };

  return (
    <section 
      ref={containerRef} 
      className="relative w-full bg-white px-8 md:px-10 lg:px-12 py-40 md:py-48 -mt-16 rounded-t-none shadow-2xl"
      style={{
        zIndex: 10,
        minHeight: "500vh",
        scrollSnapType: "y mandatory", // Enable scroll snapping
      }}
    >
      {/* 7 scroll snap points */}
      {[...Array(7)].map((_, i) => (
        <div
          key={i}
          className="absolute w-full pointer-events-none"
          style={{
            height: "100vh",
            top: `${(i / 6) * 400}vh`, // Evenly distribute across the scroll height
            scrollSnapAlign: "start",
            scrollSnapStop: "always",
          }}
        />
      ))}
      
      <div className="sticky top-0 h-screen flex items-center justify-center">
        <div className="max-w-[1600px] mx-auto w-full">
          <div className="flex items-center justify-center">
            <div 
              className="relative" 
              style={{ 
                width: `${circleRadius * 2 + 100}px`, 
                height: `${circleRadius * 2 + 100}px` 
              }}
            >
              {/* SVG Circle */}
              <svg
                className="absolute inset-0"
                width="100%"
                height="100%"
                viewBox={`0 0 ${circleRadius * 2 + 100} ${circleRadius * 2 + 100}`}
                style={{
                  transform: "rotate(-90deg)",
                }}
              >
                <circle
                  cx={(circleRadius * 2 + 100) / 2}
                  cy={(circleRadius * 2 + 100) / 2}
                  r={circleRadius}
                  fill="none"
                  stroke="#1A2551"
                  strokeWidth={strokeWidth}
                  strokeDasharray={circleCircumference}
                  strokeDashoffset={circleStrokeDashoffset}
                  strokeLinecap="round"
                  style={{
                    transition: "none",
                  }}
                />
              </svg>

              {/* Number Icons positioned around circle */}
              {steps.map((step, index) => {
                const pos = getNumberPosition(index);
                const isVisible = isNumberVisible(index);
                
                return (
                  <div
                    key={step.number}
                    className="absolute"
                    style={{
                      left: `${pos.x}px`,
                      top: `${pos.y}px`,
                      transform: "translate(-50%, -50%)",
                      opacity: isVisible ? 1 : 0,
                      transition: "opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                  >
                    {/* Number circle - smaller size */}
                    <div
                      className="relative flex items-center justify-center bg-white border-2 border-[#1A2551] rounded-full"
                      style={{
                        width: "48px",
                        height: "48px",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "'Figtree', sans-serif",
                          fontSize: "1.25rem",
                          fontWeight: 600,
                          color: "#1A2551",
                        }}
                      >
                        {step.number}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Center Text Content */}
              <div className="absolute inset-0 flex items-center justify-center p-24">
                <div className="text-center max-w-md">
                  {currentCheckpoint === 0 ? (
                    // Checkpoint 0: "How We Do It"
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
                  ) : (
                    // Checkpoints 1-6: Show corresponding step content
                    <div 
                      className="space-y-4"
                      key={currentCheckpoint} // Force re-render on checkpoint change
                    >
                      <h3
                        style={{
                          fontFamily: "'Playfair Display', serif",
                          fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
                          fontWeight: 400,
                          lineHeight: "1.3",
                          color: "#1A2551",
                          letterSpacing: "-0.01em",
                        }}
                      >
                        {steps[currentCheckpoint - 1].heading}
                      </h3>
                      <p
                        style={{
                          fontFamily: "'Figtree', sans-serif",
                          fontSize: "1rem",
                          fontWeight: 400,
                          lineHeight: "1.6",
                          color: "#4A5568",
                        }}
                      >
                        {steps[currentCheckpoint - 1].body}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}