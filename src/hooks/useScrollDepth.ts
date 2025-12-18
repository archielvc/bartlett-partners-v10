import { useEffect, useRef } from 'react';
import { trackScrollDepth } from '../utils/analytics';

export function useScrollDepth() {
  const trackedDepths = useRef<Set<number>>(new Set());

  useEffect(() => {
    const thresholds = [25, 50, 75, 90, 100];
    
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = window.scrollY;
      const percentage = Math.round((scrolled / scrollHeight) * 100);
      
      thresholds.forEach(threshold => {
        if (percentage >= threshold && !trackedDepths.current.has(threshold)) {
          trackedDepths.current.add(threshold);
          trackScrollDepth(threshold);
        }
      });
    };

    // Debounce scroll handler
    let ticking = false;
    const scrollHandler = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', scrollHandler, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', scrollHandler);
      trackedDepths.current.clear();
    };
  }, []);
}
