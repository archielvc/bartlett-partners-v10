import { ImageWithFallback } from "./figma/ImageWithFallback";
import { BookEvaluationDialog } from "./BookEvaluationDialog";
import { Button } from "./ui/button";

export function HowWeDoIt() {
  return (
    <section className="w-full bg-[#F7F7F7]">
      {/* First Section: Image Left, Two Text Sections Right */}
      <div className="flex flex-col lg:flex-row items-stretch">
        {/* Image */}
        <div className="w-full lg:w-1/2 relative aspect-square lg:aspect-auto lg:min-h-[600px]">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1639663742190-1b3dba2eebcf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBtb2Rlcm4lMjBpbnRlcmlvcnxlbnwxfHx8fDE3NjMwMzM2NDl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Luxury property interior"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Text Content - Two Sections Stacked */}
        <div className="w-full lg:w-1/2 flex flex-col">
          {/* First Text Section - Selling with Bartlett */}
          <div className="flex-1 flex flex-col justify-center py-12 lg:py-16 px-6 sm:px-8 md:px-10 lg:px-12 xl:px-20 border-b border-gray-300">
            <h3
              className="text-[#1A2551] mb-6"
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
                fontWeight: 400,
                lineHeight: "1.2",
                letterSpacing: "-0.01em",
              }}
            >
              Selling with Bartlett
            </h3>
            <p
              className="text-[#4A5568] mb-8"
              style={{
                fontFamily: "'Figtree', sans-serif",
                fontSize: "1.125rem",
                fontWeight: 400,
                lineHeight: "1.7",
              }}
            >
              There's something reassuring about a team that knows you by name. Having guided over £15 billion in property transactions across Surrey, London and Sussex, our experience runs deep — but it's our personal approach that defines us.
            </p>
            <BookEvaluationDialog>
              <Button variant="outline">
                Book Valuation
              </Button>
            </BookEvaluationDialog>
          </div>

          {/* Second Text Section - Letting with Bartlett */}
          <div className="flex-1 flex flex-col justify-center py-12 lg:py-16 px-6 sm:px-8 md:px-10 lg:px-12 xl:px-20">
            <h3
              className="text-[#1A2551] mb-6"
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
                fontWeight: 400,
                lineHeight: "1.2",
                letterSpacing: "-0.01em",
              }}
            >
              Letting with Bartlett
            </h3>
            <p
              className="text-[#4A5568] mb-8"
              style={{
                fontFamily: "'Figtree', sans-serif",
                fontSize: "1.125rem",
                fontWeight: 400,
                lineHeight: "1.7",
              }}
            >
              Lettings demand balance — between people, property, and time. We take the same thoughtful approach with every home, guiding tenants with transparency and providing landlords with a service shaped around their needs.
            </p>
            <BookEvaluationDialog>
              <Button variant="outline">
                Enquire Now
              </Button>
            </BookEvaluationDialog>
          </div>
        </div>
      </div>

      {/* Second Section: Two Text Sections Left, Image Right */}
      <div className="flex flex-col lg:flex-row items-stretch">
        {/* Text Content - Two Sections Stacked */}
        <div className="w-full lg:w-1/2 flex flex-col order-2 lg:order-1">
          {/* First Text Section - Buying with Bartlett */}
          <div className="flex-1 flex flex-col justify-center py-12 lg:py-16 px-6 sm:px-8 md:px-10 lg:px-12 xl:px-20 border-b border-gray-300">
            <h3
              className="text-[#1A2551] mb-6"
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
                fontWeight: 400,
                lineHeight: "1.2",
                letterSpacing: "-0.01em",
              }}
            >
              Buying with Bartlett
            </h3>
            <p
              className="text-[#4A5568] mb-8"
              style={{
                fontFamily: "'Figtree', sans-serif",
                fontSize: "1.125rem",
                fontWeight: 400,
                lineHeight: "1.7",
              }}
            >
              From early access to off-market opportunities to calm, expert negotiation, every stage is handled with care and confidentiality. Our knowledge extends across regions and property types, allowing us to uncover the right home for you.
            </p>
            <BookEvaluationDialog>
              <Button variant="outline">
                Enquire Now
              </Button>
            </BookEvaluationDialog>
          </div>

          {/* Second Text Section - Our Commitment to Excellence */}
          <div className="flex-1 flex flex-col justify-center py-12 lg:py-16 px-6 sm:px-8 md:px-10 lg:px-12 xl:px-20">
            <h3
              className="text-[#1A2551] mb-6"
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
                fontWeight: 400,
                lineHeight: "1.2",
                letterSpacing: "-0.01em",
              }}
            >
              Our Commitment to Excellence
            </h3>
            <p
              className="text-[#4A5568] mb-8"
              style={{
                fontFamily: "'Figtree', sans-serif",
                fontSize: "1.125rem",
                fontWeight: 400,
                lineHeight: "1.7",
              }}
            >
              We combine decades of experience with modern innovation, creating a seamless experience from initial consultation to successful completion. We don't just sell properties — we build lasting relationships.
            </p>
            <BookEvaluationDialog>
              <Button variant="outline">
                Enquire Now
              </Button>
            </BookEvaluationDialog>
          </div>
        </div>

        {/* Image */}
        <div className="w-full lg:w-1/2 relative aspect-square lg:aspect-auto lg:min-h-[600px] order-1 lg:order-2">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1685514823717-7e1ff6ee0563?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob21lJTIwZXh0ZXJpb3J8ZW58MXx8fHwxNzYzMDI5NDM4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Luxury property exterior"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}