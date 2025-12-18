import { motion, useInView, useAnimation, Variants } from "motion/react";
import { useRef, useEffect } from "react";

interface RevealProps {
  children: React.ReactNode;
  width?: "fit-content" | "100%";
  delay?: number;
  duration?: number;
  y?: number;
  threshold?: number;
  className?: string;
  variant?: "fade-up" | "fade-in" | "blur";
}

export const Reveal = ({ 
  children, 
  width = "fit-content", 
  delay = 0, 
  duration = 0.8,
  y = 40,
  threshold = 0.1,
  className = "",
  variant = "fade-up"
}: RevealProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: threshold });
  const controls = useAnimation();

  // Check for mobile - used to optimize animations
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  
  // Adjust defaults for mobile to make it feel snappier
  const finalDuration = isMobile ? duration * 0.6 : duration;
  const finalDelay = isMobile ? delay * 0.5 : delay;
  const finalY = isMobile ? y * 0.5 : y;

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  const getVariants = (): Variants => {
    switch (variant) {
      case "fade-in":
        return {
          hidden: { opacity: 0 },
          visible: { opacity: 1 },
        };
      case "blur":
        return {
          // Disable blur on mobile for performance
          hidden: { opacity: 0, filter: isMobile ? "none" : "blur(10px)" },
          visible: { opacity: 1, filter: "blur(0px)" },
        };
      case "fade-up":
      default:
        return {
          hidden: { opacity: 0, y: finalY },
          visible: { opacity: 1, y: 0 },
        };
    }
  };

  return (
    <div ref={ref} style={{ width }} className={className}>
      <motion.div
        variants={getVariants()}
        initial="hidden"
        animate={controls}
        transition={{ 
          duration: finalDuration, 
          delay: finalDelay, 
          ease: [0.22, 1, 0.36, 1] // Custom cubic bezier for "premium" feel
        }}
      >
        {children}
      </motion.div>
    </div>
  );
};
