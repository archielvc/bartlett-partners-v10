import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { submitContactForm } from "../../utils/database";
import { trackContactFormSubmit } from "../../utils/analytics";

interface InsightsNewsletterProps {
  title?: string;
  description?: string;
}

export function InsightsNewsletter({
  title = "Market Insights",
  description = "Join our exclusive mailing list for the latest property news, market analysis, and off-market opportunities in Richmond."
}: InsightsNewsletterProps) {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitContactForm({
        name: firstName || 'Newsletter Subscriber',
        email: email,
        message: 'Newsletter subscription request',
        inquiry_type: 'newsletter',
        property_id: undefined,
        propertyTitle: undefined
      });

      trackContactFormSubmit('newsletter');

      setIsSubmitted(true);
      setEmail("");
      setFirstName("");
    } catch (error) {
      console.error(error);
      alert("Failed to subscribe. Please try again.");
    }
  };

  return (
    <section className="w-full bg-[#1A2551] px-6 md:px-12 lg:px-20 py-12 md:py-20">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12">

          {/* Left: Content */}
          <div className="lg:w-1/2 text-left">
            <h2
              className="text-white text-3xl md:text-4xl mb-4"
              style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
            >
              {title}
            </h2>
            <p className="text-white/60 text-lg font-light max-w-xl" style={{ fontFamily: "'Figtree', sans-serif" }}>
              {description}
            </p>
          </div>

          {/* Right: Form or Success Message */}
          <div className="lg:w-1/2 w-full">
            {isSubmitted ? (
              <div className="max-w-xl ml-auto bg-[#8E8567]/10 border border-[#8E8567] p-8 rounded-md animate-fade-in relative overflow-hidden">
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#8E8567]/10 rounded-full blur-2xl -mr-12 -mt-12 pointer-events-none"></div>

                <div className="relative z-10">
                  <h3
                    className="text-white text-2xl mb-3"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    Thank you for subscribing
                  </h3>
                  <p
                    className="text-white/80 font-light mb-6"
                    style={{ fontFamily: "'Figtree', sans-serif" }}
                  >
                    You have successfully joined our mailing list. Look out for our latest market insights and exclusive property updates in your inbox.
                  </p>
                  <Button
                    onClick={() => setIsSubmitted(false)}
                    variant="ghost"
                    className="text-[#8E8567] hover:text-white hover:bg-[#8E8567]/20 p-0 h-auto w-auto justify-start font-medium transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      Subscribe another email <ArrowRight className="w-4 h-4" />
                    </span>
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-3 max-w-2xl ml-auto">
                <input
                  type="text"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="w-full lg:w-1/3 bg-transparent border border-[#8E8567] text-white px-4 py-3 rounded-md placeholder:text-white/60 focus:outline-none focus:ring-1 focus:ring-[#8E8567] transition-all text-sm"
                  style={{ fontFamily: "'Figtree', sans-serif" }}
                />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full lg:flex-1 bg-transparent border border-[#8E8567] text-white px-4 py-3 rounded-md placeholder:text-white/60 focus:outline-none focus:ring-1 focus:ring-[#8E8567] transition-all text-sm"
                  style={{ fontFamily: "'Figtree', sans-serif" }}
                />
                <Button
                  type="submit"
                  premium
                  className="w-full lg:w-auto bg-[#8E8567] text-white border-none rounded-md px-8 py-3 flex items-center justify-center gap-2 transition-colors duration-300 hover:bg-[#8E8567] whitespace-nowrap"
                >
                  <span>Subscribe</span>
                </Button>
              </form>
            )}
          </div>

        </div>
      </div >
    </section >
  );
}