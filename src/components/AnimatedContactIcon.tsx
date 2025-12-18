import { useRef, useEffect, useState, ReactNode } from "react";
import { useInView } from "motion/react";

interface AnimatedContactIconProps {
  icon: ReactNode;
  title: string;
  content: string;
  href?: string;
  target?: string;
  rel?: string;
  isMobile: boolean;
}

export function AnimatedContactIcon({ 
  icon, 
  title, 
  content, 
  href, 
  target, 
  rel, 
  isMobile 
}: AnimatedContactIconProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { 
    margin: "-50% 0px -50% 0px" // Trigger when element is at center of viewport
  });
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (isInView && isMobile && !hasAnimated) {
      // Animation disabled on mobile for cleaner experience
      // const timer = setTimeout(() => {
      //   setHasAnimated(true);
      // }, 400);
      // return () => clearTimeout(timer);
    }
  }, [isInView, isMobile, hasAnimated]);

  const Wrapper = href ? 'a' : 'div';
  const wrapperProps = href ? { href, target, rel } : {};

  return (
    <Wrapper 
      {...wrapperProps}
      ref={ref}
      className="flex items-start gap-4 group cursor-pointer"
    >
      <div 
        className={`w-16 h-16 rounded-full bg-gradient-to-br from-[#1A2551]/5 to-[#8E8567]/5 flex items-center justify-center relative overflow-hidden transition-all duration-700 ease-out group-hover:scale-110 group-hover:shadow-xl flex-shrink-0`}
      >
        {/* Animated background gradient on hover only (not on mobile scroll) */}
        <div 
          className={`absolute inset-0 bg-gradient-to-br from-[#1A2551] to-[#8E8567] transition-opacity duration-700 ease-out opacity-0 group-hover:opacity-100`}
        />
        
        {/* Icon */}
        <div 
          className={`text-[#1A2551] relative z-10 transition-all duration-700 ease-out group-hover:text-white group-hover:scale-110`}
        >
          {icon}
        </div>
      </div>
      <div>
        <h3 
          className="text-[#1A2551] mb-2"
          style={{ 
            fontFamily: "'Figtree', sans-serif",
            fontSize: "1rem",
            fontWeight: 600
          }}
        >
          {title}
        </h3>
        <span 
          className="text-[#3A3A3A] group-hover:text-[#1A2551] transition-colors"
          style={{ 
            fontFamily: "'Figtree', sans-serif",
            fontSize: "0.9375rem",
            lineHeight: "1.6"
          }}
        >
          {content}
        </span>
      </div>
    </Wrapper>
  );
}