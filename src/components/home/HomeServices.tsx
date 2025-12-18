import { useNavigate } from "react-router-dom";
import { OptimizedImage } from "../OptimizedImage";
import { BookEvaluationDialog } from "../BookEvaluationDialog";
import { PropertyInquiryDialog } from "../PropertyInquiryDialog";
import { Button } from "../ui/button";
import { useSiteSettings } from "../../contexts/SiteContext";

export function HomeServices() {
  const navigate = useNavigate();
  const { images } = useSiteSettings();

  const panelClasses = "w-full lg:w-1/3 relative min-h-[500px] md:min-h-[450px] lg:min-h-[400px] flex flex-col";
  // Standardized padding for all panels - consistent with HomeExperience
  const paddingClasses = "p-6 md:p-8 lg:p-12";

  return (
    <section className="w-full h-auto lg:h-[700px] flex flex-col lg:flex-row">
      {/* Panel 1: Introduction (Dark Navy) */}
      <div
        className={`${panelClasses} bg-[#1A2551] ${paddingClasses}`}
        style={{ paddingLeft: "max(2rem, calc((100vw - 1600px) / 2 + 5rem))" }}
      >
        <div className="flex flex-col gap-6 lg:gap-8">
          <div>
            <span
              className="text-[#8E8567] uppercase tracking-widest text-xs font-medium mb-6 block"
              style={{ fontFamily: "'Figtree', sans-serif" }}
            >
              Your Local Property Experts
            </span>
            <h2
              className="text-white text-3xl lg:text-4xl leading-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Richmond's Boutique Estate Agency
            </h2>
          </div>

          <p className="text-white/80 text-sm max-w-md leading-relaxed" style={{ fontFamily: "'Figtree', sans-serif" }}>
            For over 30 years, we have helped families buy and sell homes across the London Borough of Richmond upon Thames. Unlike traditional agencies, we limit ourselves to just 10 clients at any time, so you receive the attention, expertise and results your home deserves.
          </p>
        </div>
      </div>

      {/* Panel 2: Buying (Image) */}
      <div className={`${panelClasses} group overflow-hidden`}>
        <OptimizedImage
          src={images.home.h_buy_img || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"}
          alt="Buying in Twickenham"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 lg:group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 lg:group-hover:opacity-90 transition-opacity duration-500" />

        <div className={`absolute bottom-0 left-0 w-full flex flex-col items-start justify-end h-full ${paddingClasses}`}>
          <div className="max-w-sm">
            <h3
              className="text-white text-4xl lg:text-5xl mb-6"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Buying
            </h3>
            <p className="text-white/90 text-sm leading-relaxed mb-8">
              Looking for your next home in Richmond, Twickenham or Teddington? We know these neighbourhoods inside out, from the quiet streets to the best school catchments and the hidden gems that never reach Rightmove.
              <br /><br />
              As your retained buying agent, we search the entire market including off-market opportunities, negotiate on your behalf and ensure you pay the right price for the right property.
            </p>
            <PropertyInquiryDialog trigger={
              <Button
                variant="hero"
                premium
                className="px-8 shadow-lg"
              >
                Enquire Now
              </Button>
            } />
          </div>
        </div>
      </div>

      {/* Panel 3: Selling (Image) */}
      <div className={`${panelClasses} group overflow-hidden`}>
        <OptimizedImage
          src={images.home.h_sell_img || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"}
          alt="Selling in Teddington"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 lg:group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 lg:group-hover:opacity-90 transition-opacity duration-500" />

        <div className={`absolute bottom-0 left-0 w-full flex flex-col items-start justify-end h-full ${paddingClasses}`}>
          <div className="max-w-sm">
            <h3
              className="text-white text-4xl lg:text-5xl mb-6"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Selling
            </h3>
            <p className="text-white/90 text-sm leading-relaxed mb-8">
              When you instruct Bartlett & Partners, you work directly with our directors from valuation to completion. No junior agents, no weekend assistants. Just 30 years of expertise focused entirely on achieving the best outcome for your sale.
              <br /><br />
              Our marketing includes cinematic property films, drone photography and targeted campaigns across our network of qualified buyers.
            </p>

            <BookEvaluationDialog trigger={
              <Button
                variant="hero"
                premium
                className="px-8 shadow-lg"
              >
                Book Valuation
              </Button>
            } />
          </div>
        </div>
      </div>
    </section>
  );
}