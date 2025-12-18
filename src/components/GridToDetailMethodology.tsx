import { useState } from "react";
import { X } from "lucide-react";

export function GridToDetailMethodology() {
  const [selectedStep, setSelectedStep] = useState<number | null>(null);

  const steps = [
    {
      number: 1,
      heading: "Discovery & Understanding",
      body: "We begin by deeply understanding your unique objectives, timeline, and vision to create a tailored approach.",
    },
    {
      number: 2,
      heading: "Market Analysis",
      body: "Comprehensive market research and competitive analysis inform every strategic decision we make.",
    },
    {
      number: 3,
      heading: "Strategic Positioning",
      body: "We craft a distinctive narrative that positions your property to attract the right audience.",
    },
    {
      number: 4,
      heading: "Curated Marketing",
      body: "Sophisticated campaigns across select channels ensure maximum impact with discerning buyers.",
    },
    {
      number: 5,
      heading: "Expert Negotiation",
      body: "Our seasoned team secures optimal terms while maintaining the integrity of the transaction.",
    },
    {
      number: 6,
      heading: "Seamless Execution",
      body: "Meticulous attention to detail ensures a smooth, stress-free process from offer to close.",
    },
  ];

  return (
    <section className="relative w-full bg-white px-8 md:px-16 lg:px-24 py-32 md:py-40">
      <div className="max-w-[1400px] mx-auto">
        {/* Title */}
        <div className="mb-16 md:mb-24">
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(2.5rem, 5vw, 4rem)",
              fontWeight: 400,
              lineHeight: "1.2",
              color: "#1A2551",
              letterSpacing: "-0.02em",
            }}
          >
            How We Do It
          </h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {steps.map((step) => (
            <button
              key={step.number}
              onClick={() => setSelectedStep(step.number)}
              className="group relative bg-[#F7F7F7] hover:bg-[#1A2551] rounded-lg p-8 md:p-12 text-left transition-all duration-500 ease-out cursor-pointer border-2 border-transparent hover:border-[#1A2551] hover:shadow-2xl"
            >
              {/* Number */}
              <div
                className="mb-6 group-hover:text-white transition-colors duration-500"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "clamp(3rem, 6vw, 4rem)",
                  fontWeight: 400,
                  color: "#1A2551",
                  lineHeight: "1",
                }}
              >
                {step.number}
              </div>

              {/* Heading */}
              <h3
                className="group-hover:text-white transition-colors duration-500"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "clamp(1.5rem, 2.5vw, 1.75rem)",
                  fontWeight: 400,
                  lineHeight: "1.3",
                  color: "#1A2551",
                  letterSpacing: "-0.01em",
                }}
              >
                {step.heading}
              </h3>

              {/* Subtle indicator */}
              <div className="absolute bottom-8 right-8 w-2 h-2 rounded-full bg-[#1A2551] group-hover:bg-white transition-colors duration-500" />
            </button>
          ))}
        </div>
      </div>

      {/* Full-Screen Detail View */}
      {selectedStep !== null && (
        <div
          className="fixed inset-0 bg-white z-50 flex items-center justify-center px-8 md:px-16"
          style={{
            animation: "fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <style>
            {`
              @keyframes fadeIn {
                from {
                  opacity: 0;
                }
                to {
                  opacity: 1;
                }
              }
            `}
          </style>

          {/* Close Button */}
          <button
            onClick={() => setSelectedStep(null)}
            className="absolute top-8 right-8 md:top-12 md:right-12 w-12 h-12 flex items-center justify-center rounded-full border-2 border-[#1A2551] hover:bg-[#1A2551] hover:text-white transition-all duration-300 group"
            aria-label="Close"
          >
            <X className="w-6 h-6" strokeWidth={1.5} />
          </button>

          {/* Content */}
          <div className="max-w-[900px] mx-auto text-center">
            {/* Number */}
            <div
              className="mb-8"
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(6rem, 12vw, 10rem)",
                fontWeight: 400,
                color: "#1A2551",
                lineHeight: "1",
                opacity: 0.15,
              }}
            >
              {selectedStep}
            </div>

            {/* Heading */}
            <h3
              className="mb-8"
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(2.5rem, 5vw, 4rem)",
                fontWeight: 400,
                lineHeight: "1.2",
                color: "#1A2551",
                letterSpacing: "-0.02em",
              }}
            >
              {steps[selectedStep - 1].heading}
            </h3>

            {/* Body */}
            <p
              style={{
                fontFamily: "'Figtree', sans-serif",
                fontSize: "clamp(1.125rem, 2vw, 1.5rem)",
                fontWeight: 400,
                lineHeight: "1.7",
                color: "#4A5568",
                maxWidth: "700px",
                margin: "0 auto",
              }}
            >
              {steps[selectedStep - 1].body}
            </p>

            {/* Navigation Dots */}
            <div className="flex items-center justify-center gap-3 mt-16">
              {steps.map((step) => (
                <button
                  key={step.number}
                  onClick={() => setSelectedStep(step.number)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    selectedStep === step.number
                      ? "bg-[#1A2551] w-8"
                      : "bg-[#E5E5E5] hover:bg-[#1A2551]/50"
                  }`}
                  aria-label={`Go to step ${step.number}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
