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
  title = "Market Insights to Your Inbox",
  description = "Join our exclusive mailing list for the latest property news, market analysis, and off-market opportunities in Richmond."
}: InsightsNewsletterProps) {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitContactForm({
        name: `${firstName} ${lastName}`.trim() || 'Newsletter Subscriber',
        email: email,
        message: 'Newsletter subscription request',
        inquiry_type: 'newsletter',
        property_id: null,
        propertyTitle: null
      });

      trackContactFormSubmit('newsletter');

      alert("Thank you for subscribing!");
      setEmail("");
      setFirstName("");
      setLastName("");
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

          {/* Right: Form */}
          <div className="lg:w-1/2 w-full">
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-xl ml-auto">
              {/* Name Row */}
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="w-1/2 bg-transparent border border-[#8E8567] text-white px-4 py-2 rounded-md placeholder:text-white/60 focus:outline-none focus:ring-1 focus:ring-[#8E8567] transition-all h-11 min-w-0 text-sm"
                  style={{ fontFamily: "'Figtree', sans-serif" }}
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-1/2 bg-transparent border border-[#8E8567] text-white px-4 py-2 rounded-md placeholder:text-white/60 focus:outline-none focus:ring-1 focus:ring-[#8E8567] transition-all h-11 min-w-0 text-sm"
                  style={{ fontFamily: "'Figtree', sans-serif" }}
                />
              </div>

              {/* Email & Subscribe Row */}
              <div className="flex gap-3 h-11">
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 bg-transparent border border-[#8E8567] text-white px-4 py-2 rounded-md placeholder:text-white/60 focus:outline-none focus:ring-1 focus:ring-[#8E8567] transition-all min-w-0 h-full text-sm"
                  style={{ fontFamily: "'Figtree', sans-serif" }}
                />
                <Button
                  type="submit"
                  premium
                  className="bg-[#8E8567] text-white border-none rounded-md h-full px-6 flex items-center justify-center gap-3 transition-colors duration-300"
                >
                  <span>Subscribe</span>
                </Button>
              </div>
            </form>
          </div>

        </div>
      </div >
    </section >
  );
}