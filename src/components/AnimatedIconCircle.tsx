import { useRef, useEffect, useState, ComponentType } from "react";
import { useInView } from "motion/react";
import { LucideProps } from "lucide-react";

interface AnimatedIconCircleProps {
  Icon: ComponentType<LucideProps>;
  isMobile: boolean;
  children?: React.ReactNode;
}

export function AnimatedIconCircle({ Icon, isMobile, children }: AnimatedIconCircleProps) {
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

  return (
    <div ref={ref} className="flex flex-col gap-4 group cursor-default">
      {/* Icon with premium styling and hover animation */}
      <div 
        className={`w-16 h-16 rounded-full bg-gradient-to-br from-[#1A2551]/5 to-[#8E8567]/5 flex items-center justify-center relative overflow-hidden transition-all duration-700 ease-out group-hover:scale-110 group-hover:shadow-xl`}
      >
        {/* Animated background gradient on hover only (not on mobile scroll) */}
        <div 
          className={`absolute inset-0 bg-gradient-to-br from-[#1A2551] to-[#8E8567] transition-opacity duration-700 ease-out opacity-0 group-hover:opacity-100`}
        />
        
        {/* Icon */}
        <Icon 
          className={`w-7 h-7 text-[#1A2551] relative z-10 transition-all duration-700 ease-out group-hover:text-white group-hover:scale-110`}
          strokeWidth={1.5} 
        />
      </div>

      {/* Children content (title, description, etc.) */}
      {children}
    </div>
  );
}