import { motion, AnimatePresence } from "motion/react";
import { Button } from "./ui/button";
import { X } from "lucide-react";
import { useCookie } from "../contexts/CookieContext";
import { trackEvent } from "../utils/analytics";

export function CookieBanner() {
  const { isBannerVisible, setBannerVisible, acceptAll, rejectAll, openSettings } = useCookie();

  return (
    <AnimatePresence>
      {isBannerVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} // Ultra-smooth easing
          className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-8 pointer-events-none"
        >
          <div className="max-w-[1600px] mx-auto pointer-events-auto">
            {/* 
              Premium Design Language:
              - Colors: Deep Navy (#1A2551) background for premium feel, unlike the white usually used. 
              - Shapes: Rounded corners (rounded-2xl) to match TwoStepPopup.
              - Border: Subtle white border for definition.
              - Typography: Playfair Display for headers.
            */}
            <div className="bg-[#1A2551] text-white shadow-2xl rounded-xl md:rounded-2xl p-6 md:p-8 md:max-w-[420px] md:ml-auto relative overflow-hidden border border-white/10">

              {/* Background Decoration matching TwoStepPopup aesthetic */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#8E8567]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

              <div className="flex flex-col gap-5 relative z-10">
                <div className="flex justify-between items-start gap-4">
                  <h3
                    className="text-white text-xl md:text-2xl"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    Privacy Preference
                  </h3>
                  <button
                    onClick={() => setBannerVisible(false)}
                    className="text-white/40 hover:text-white transition-colors p-1 -mr-2 -mt-2 rounded-full hover:bg-white/10"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <p
                  className="text-white/70 text-sm leading-relaxed font-light"
                  style={{ fontFamily: "'Figtree', sans-serif" }}
                >
                  We respect your privacy. This website uses cookies to ensure you get the best experience.
                  <a href="/privacy-policy" className="text-white/90 hover:text-[#8E8567] underline decoration-white/30 hover:decoration-[#8E8567] transition-all ml-1">Read Policy</a>
                </p>

                <div className="flex flex-col gap-3 mt-2">
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={() => {
                        acceptAll();
                        trackEvent('click', 'Cookie Consent', 'Accept All');
                      }}
                      premium
                      className="bg-white text-[#1A2551] border-white hover:bg-white/90 h-10 w-full"
                    >
                      Accept
                    </Button>
                    <Button
                      onClick={() => {
                        openSettings();
                        trackEvent('click', 'Cookie Consent', 'Preferences');
                      }}
                      variant="outline"
                      premium
                      className="bg-transparent border-white/20 text-white hover:bg-white/10 hover:border-white hover:text-white h-10 w-full"
                    >
                      Preferences
                    </Button>
                  </div>

                  <button
                    onClick={rejectAll}
                    className="text-[10px] text-white/30 hover:text-white transition-colors uppercase tracking-widest font-medium mt-1 self-center"
                    style={{ fontFamily: "'Figtree', sans-serif" }}
                  >
                    Decline All
                  </button>
                </div>
              </div>

            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
