import { useState, useEffect } from "react";
import { Phone } from "lucide-react";
import { useLocation } from "react-router-dom";
import { BookEvaluationDialog } from "./BookEvaluationDialog";
import { Button } from "./ui/button";
import { trackPhoneClick } from "../utils/analytics";

/**
 * Global sticky mobile CTA bar for conversion optimization.
 * Displays "Book Valuation" (2/3) and "Call" (1/3) buttons.
 * Hidden on: Property Detail (has own bar), Contact page, desktop, and before scrolling past hero.
 */
export function StickyMobileCTA() {
    const location = useLocation();
    const [isVisible, setIsVisible] = useState(false);

    // Track scroll position to show bar only after hero
    useEffect(() => {
        // Start hidden - don't show immediately
        let timeoutId: NodeJS.Timeout;

        const handleScroll = () => {
            // Show after scrolling past roughly 60% of viewport height (hero section)
            const heroThreshold = window.innerHeight * 0.6;
            const shouldShow = window.scrollY > heroThreshold;
            setIsVisible(shouldShow);
        };

        // Delay initial check to ensure page is fully loaded and scroll position is accurate
        timeoutId = setTimeout(() => {
            handleScroll();
            window.addEventListener('scroll', handleScroll, { passive: true });
        }, 100);

        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    // Pages where this component should NOT appear
    const excludedPaths = [
        '/properties/', // Property Detail has its own sticky bar
        '/contact',   // Contact page already has CTAs
    ];

    // Check if current path should be excluded
    const shouldHide = excludedPaths.some(path =>
        location.pathname.startsWith(path) || location.pathname === path
    );

    if (shouldHide) {
        return null;
    }

    return (
        <div
            className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 md:hidden z-40 shadow-lg transition-all duration-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
                }`}
        >
            <div className="grid grid-cols-3 gap-3">
                {/* Book Valuation - 2/3 width (spans 2 columns) */}
                <div className="col-span-2">
                    <BookEvaluationDialog
                        trigger={
                            <Button variant="default" className="w-full">
                                Book Valuation
                            </Button>
                        }
                    />
                </div>

                {/* Call - 1/3 width (spans 1 column) */}
                <div className="col-span-1">
                    <Button variant="outline" className="w-full" asChild>
                        <a
                            href="tel:02086141441"
                            onClick={() => trackPhoneClick('02086141441')}
                            className="flex items-center justify-center gap-2 font-bold"
                        >
                            <Phone className="w-4 h-4" />
                            <span>Call</span>
                        </a>
                    </Button>
                </div>
            </div>
        </div>
    );
}
