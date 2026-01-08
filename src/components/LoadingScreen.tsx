import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import { useSiteSettings } from "../contexts/SiteContext";
import { prefetchCriticalData } from "../lib/prefetch";

export function LoadingScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [shouldRender, setShouldRender] = useState(true);
  const { images } = useSiteSettings();
  // Use CMS logo if available, otherwise fallback to local logo for instant loading
  const LOCAL_LOAD_LOGO = '/logo-load.png';
  const stagImage = (images.branding as any).brand_logo_load || images.branding.brand_logo_white || LOCAL_LOAD_LOGO;

  useEffect(() => {
    // Check if user has visited before in this session
    const hasVisited = sessionStorage.getItem("hasVisited");

    if (hasVisited) {
      setIsVisible(false);
      setShouldRender(false);
      return;
    }

    // Prevent scrolling while loading
    document.body.style.overflow = "hidden";

    // Prefetch critical data during the loading screen
    // This runs in parallel with the timer, so data is ready when home page renders
    prefetchCriticalData().catch(console.error);

    // Sequence:
    // 1. Show logo (0s)
    // 2. Hold for a bit (1.5s)
    // 3. Fade out (2s)
    const timer = setTimeout(() => {
      setIsVisible(false);
      sessionStorage.setItem("hasVisited", "true");
      document.body.style.overflow = "unset";
    }, 2500);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = "unset";
    };
  }, []);

  if (!shouldRender) return null;

  return (
    <AnimatePresence mode="wait" onExitComplete={() => setShouldRender(false)}>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#1A2551]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="relative flex flex-col items-center justify-center">
            {/* Stag Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
                transition: { duration: 1, ease: "easeOut" }
              }}
              exit={{
                scale: 1.05,
                opacity: 0,
                transition: { duration: 0.5 }
              }}
              className="w-32 md:w-48 relative"
            >
              {stagImage ? (
                <img
                  src={stagImage}
                  alt="Bartlett & Partners"
                  className="w-full h-full object-contain opacity-90"
                />
              ) : (
                <div className="text-3xl text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Bartlett & Partners</div>
              )}

              {/* Subtle Glow Effect */}
              <div className="absolute inset-0 bg-white/20 blur-[40px] rounded-full -z-10 scale-150 opacity-0 animate-pulse" />
            </motion.div>

            {/* Progress Line */}
            <motion.div
              className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-24 h-[1px] bg-white/20 overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.5 } }}
            >
              <motion.div
                className="w-full h-full bg-white"
                initial={{ x: "-100%" }}
                animate={{ x: "0%" }}
                transition={{ duration: 2, ease: "easeInOut" }}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
