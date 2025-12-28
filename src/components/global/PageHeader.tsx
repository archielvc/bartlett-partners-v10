import { useTextReveal } from "../../hooks/animations/useTextReveal";
import { useScrollReveal } from "../../hooks/animations/useScrollReveal";

interface PageHeaderProps {
    title: string;
    subtitle?: string;
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
    const titleRef = useTextReveal();
    const containerRef = useScrollReveal({
        stagger: 0.1,
        delay: 0.2, // Wait for title a bit
        y: 30
    });

    return (
        <section className="relative w-full bg-white pt-24 pb-6 md:pt-32 md:pb-8 border-b border-gray-100 px-6 md:px-12 lg:px-20">
            <div className="max-w-[1600px] mx-auto">
                <div className="flex flex-col items-start text-left">
                    <h1
                        ref={titleRef as any}
                        className="text-[#1A2551] font-light leading-[1.0] mb-2 opacity-0"
                        style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: "clamp(3.5rem, 12vw, 9rem)"
                        }}
                    >
                        {title}<span className="text-[#8E8567]">.</span>
                    </h1>

                    <div ref={containerRef as any}>
                        {subtitle && (
                            <p
                                className="text-gray-500 text-sm md:text-base max-w-2xl font-light tracking-wide mb-8"
                                style={{ fontFamily: "'Figtree', sans-serif" }}
                            >
                                {subtitle}
                            </p>
                        )}
                        <div className="w-12 h-[1px] bg-[#8E8567]/30" />
                    </div>
                </div>
            </div>
        </section>
    );
}
