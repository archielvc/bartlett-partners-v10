import { useRef, useEffect, useState } from "react";
import { useInView } from "motion/react";

interface AnimatedNumberCircleProps {
  number: string | number;
  isMobile: boolean;
}

export function AnimatedNumberCircle({ number, isMobile }: AnimatedNumberCircleProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { 
    margin: "-50% 0px -50% 0px" // Trigger when element is at center of viewport
  });
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (isInView && isMobile && !hasAnimated) {
      // Add 400ms delay so users can see the initial state before animation
      const timer = setTimeout(() => {
        setHasAnimated(true);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isInView, isMobile, hasAnimated]);

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <div 
        className={`w-20 h-20 rounded-full border-2 border-[#1A2551]/20 flex items-center justify-center relative overflow-hidden transition-all duration-700 ease-out group-hover:border-[#1A2551] group-hover:scale-110 group-hover:shadow-lg ${
          isMobile && hasAnimated ? 'border-[#1A2551] scale-110 shadow-lg' : ''
        }`}
      >
        {/* Animated background on hover or scroll (mobile) */}
        <div 
          className={`absolute inset-0 bg-gradient-to-br from-[#1A2551] to-[#8E8567] transition-all duration-700 ease-out ${
            isMobile && hasAnimated 
              ? 'opacity-100 scale-100' 
              : 'opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100'
          }`}
          style={{ transition: "opacity 0.7s ease-out, transform 0.7s ease-out" }}
        />
        
        <span 
          className={`relative z-10 text-[#1A2551] group-hover:text-white transition-colors duration-700 flex items-center justify-center ${
            isMobile && hasAnimated ? 'text-white' : ''
          }`}
          style={{ 
            fontFamily: "'Playfair Display', serif",
            fontSize: "1.5rem",
            fontWeight: 400
          }}
        >
          {number}
        </span>
      </div>
    </div>
  );
}
