import { useState, useEffect, useRef } from 'react';
import { ImageWithFallback } from './ui/ImageWithFallback';
import { Button } from './ui/button';

interface SubSection {
  title: string;
  description: string;
  image: string;
}

interface ScrollSectionProps {
  label: string;
  mainTitle: string;
  mainTitleLine2: string;
  description: string;
  subSections: SubSection[];
  imagePosition: 'left' | 'right';
  buttonText1?: string;
  buttonText2?: string;
}

export function ScrollSection({
  label,
  mainTitle,
  mainTitleLine2,
  description,
  subSections,
  imagePosition,
  buttonText1 = "Learn",
  buttonText2 = "Explore"
}: ScrollSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current || !contentRef.current) return;

      const sectionRect = sectionRef.current.getBoundingClientRect();
      const contentHeight = contentRef.current.clientHeight;

      // Calculate how far we've scrolled through this section
      // The section becomes "active" when it reaches the top of the viewport
      if (sectionRect.top <= 0 && sectionRect.bottom > contentHeight) {
        const scrolledDistance = Math.abs(sectionRect.top);
        const scrollPerSection = window.innerHeight * 0.8; // Each subsection takes 80vh
        const calculatedIndex = Math.min(
          Math.floor(scrolledDistance / scrollPerSection),
          subSections.length - 1
        );
        setActiveIndex(calculatedIndex);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, [subSections.length]);

  // Calculate the height needed for the section to allow scrolling through all subsections
  const sectionHeight = `calc(100vh + ${subSections.length * 80}vh)`;

  return (
    <section
      ref={sectionRef}
      className="w-full bg-white relative"
      style={{ height: sectionHeight }}
    >
      <div
        ref={contentRef}
        className="sticky top-0 w-full h-screen py-20 px-6 lg:px-16 flex items-center"
      >
        <div className="max-w-[1280px] mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Content */}
            <div className={imagePosition === 'left' ? 'order-1 lg:order-2' : ''}>
              <p
                className="text-[#1A2551] mb-6"
                style={{
                  fontFamily: "'Figtree', sans-serif",
                  fontSize: "0.875rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em"
                }}
              >
                {label}
              </p>
              <h2
                className="text-[#1A2551] mb-6"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
                  fontWeight: 400,
                  lineHeight: "1.3"
                }}
              >
                {mainTitle}<br />{mainTitleLine2}
              </h2>
              <p
                className="text-[#6B7280] mb-12"
                style={{
                  fontFamily: "'Figtree', sans-serif",
                  fontSize: "0.9375rem",
                  lineHeight: "1.7"
                }}
              >
                {description}
              </p>

              <div className="space-y-8 mb-12">
                {subSections.map((subSection, index) => {
                  const isActive = index === activeIndex;
                  return (
                    <div key={index} className="transition-all duration-300">
                      <h3
                        className={`mb-3 transition-all duration-300 ${isActive ? 'text-[#1A2551]' : 'text-[#6B7280]'
                          }`}
                        style={{
                          fontFamily: "'Playfair Display', serif",
                          fontSize: isActive ? "1.375rem" : "1.125rem",
                          fontWeight: 400,
                          lineHeight: "1.3"
                        }}
                      >
                        {subSection.title}
                      </h3>
                      <p
                        className="text-[#6B7280]"
                        style={{
                          fontFamily: "'Figtree', sans-serif",
                          fontSize: "0.875rem",
                          lineHeight: "1.6"
                        }}
                      >
                        {subSection.description}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-4">
                <Button variant="default">
                  {buttonText1}
                </Button>
                <Button variant="outline">
                  {buttonText2}
                </Button>
              </div>
            </div>

            {/* Image */}
            <div className={`relative aspect-[4/5] overflow-hidden ${imagePosition === 'left' ? 'order-2 lg:order-1' : ''
              }`}>
              {subSections.map((subSection, index) => (
                <div
                  key={index}
                  className="absolute inset-0 transition-opacity duration-700"
                  style={{ opacity: index === activeIndex ? 1 : 0 }}
                >
                  <ImageWithFallback
                    src={subSection.image}
                    alt={subSection.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}