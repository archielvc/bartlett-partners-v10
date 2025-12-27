import { Reveal } from "../animations/Reveal";
import { useSiteImage } from "../../hooks/useSiteImage";
import { ImageWithFallback } from "../ui/ImageWithFallback";
import { getOptimizedUrl } from "../OptimizedImage";

interface InsightsHeroProps {
    image?: string;
}

export function InsightsHero({ image }: InsightsHeroProps) {
    const { src: rawHeroImage, alt: heroAlt } = useSiteImage('i_hero_bg');
    const heroImage = image || (rawHeroImage ? getOptimizedUrl(rawHeroImage, 2000, 80, 'webp') : '');

    return (
        <section id="hero-section" className="relative w-full h-[70vh] md:h-[60vh] lg:h-[50vh] rounded-b-[40px] md:rounded-b-[80px] overflow-hidden bg-[#1A2551]">
            {heroImage && (
                <ImageWithFallback
                    src={heroImage}
                    alt={heroAlt || "Insights hero"}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="eager"
                />
            )}

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/10 to-black/40 z-10" />

            {/* Hero Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center px-6 pt-24 md:pt-0">
                <Reveal width="100%" variant="fade-up">
                    <div className="text-center relative z-10 flex flex-col items-center">

                        {/* Main Heading */}
                        <h1
                            className="text-5xl md:text-7xl font-light mb-3 text-white leading-[1.1]"
                            style={{ fontFamily: "'Playfair Display', serif" }}
                        >
                            Insights
                        </h1>

                    </div>
                </Reveal>
            </div>
        </section>
    );
}