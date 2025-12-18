import { ReactNode, useState, useEffect, useRef } from "react";

export function ScrollWrapper({ children }: { children: ReactNode }) {
  const [scrollY, setScrollY] = useState(0);
  const rafRef = useRef<number>();

  useEffect(() => {
    const handleScroll = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        setScrollY(window.scrollY);
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  // Calculate shadow intensity based on scroll - increases as you scroll down
  const scrollProgress = Math.min(scrollY / 800, 1);
  const shadowIntensity = 0.2 + (scrollProgress * 0.15); // 0.2 to 0.35
  const shadowSpread = 40 + (scrollProgress * 40); // 40px to 80px

  return (
    <div 
      className="relative z-10 bg-white rounded-t-[32px]"
      style={{
        minHeight: '100vh',
        boxShadow: `
          0 -${shadowSpread * 3}px ${shadowSpread * 3}px rgba(0, 0, 0, ${shadowIntensity * 1.5}), 
          0 -${shadowSpread * 1.5}px ${shadowSpread * 1.5}px rgba(0, 0, 0, ${shadowIntensity}), 
          0 -${shadowSpread * 0.75}px ${shadowSpread * 0.75}px rgba(0, 0, 0, ${shadowIntensity * 0.75})
        `,
        transition: 'box-shadow 0.1s linear',
      }}
    >
      {children}
    </div>
  );
}