import { BookEvaluationDialog } from "../BookEvaluationDialog";
import { ImageWithFallback } from "../figma/ImageWithFallback";

export function HomeCTA() {
  return (
    <section className="w-full bg-white pb-24 md:pb-32 px-6 md:px-12 lg:px-20">
      <div className="max-w-[1600px] mx-auto text-center mb-16">
        <p className="text-[#8E8567] text-sm uppercase tracking-widest mb-4">What are you waiting for?</p>
        <h2
          className="text-[#1A2551] text-5xl lg:text-7xl mb-12"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Book a valuation
        </h2>

        <BookEvaluationDialog>
          <button className="px-10 py-4 bg-[#1A2551] text-white rounded-full text-sm font-bold hover:bg-[#1A2551]/90 transition-all duration-300 uppercase tracking-wider">
            Get Started
          </button>
        </BookEvaluationDialog>
      </div>

      <div className="w-full max-w-[1600px] mx-auto h-[500px] lg:h-[700px] relative rounded-none overflow-hidden group">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=80"
          alt="Luxury Interior"
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
        />
        <div className="absolute bottom-8 right-8 bg-white/20 backdrop-blur-md px-6 py-3 text-white text-sm font-medium tracking-wider uppercase border border-white/30">
          Interior Design Showcase
        </div>
      </div>
    </section>
  );
}
