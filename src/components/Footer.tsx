import { Instagram, Facebook, Linkedin, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ImageWithFallback } from "./ui/ImageWithFallback";
import { Button } from "./ui/button";
import { useSiteSettings } from "../contexts/SiteContext";
import { trackEvent, trackNavigation, trackContactFormSubmit } from "../utils/analytics";
import { useState } from "react";
import { submitContactForm } from "../utils/database";

export function Footer() {
  const navigate = useNavigate();
  const { images } = useSiteSettings();
  const whiteLogo = images.branding.brand_logo_white;

  const handleNavClick = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    trackNavigation(path);
    navigate(path);
    window.scrollTo(0, 0);
  };

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitContactForm({
        name: name || 'Newsletter Subscriber',
        email: email,
        message: 'Footer newsletter subscription',
        inquiry_type: 'newsletter',
      });
      trackContactFormSubmit('newsletter');
      setIsSubmitted(true);
      setEmail("");
    } catch (error) {
      console.error("Newsletter subscription failed:", error);
    }
  };



  return (
    <footer
      className="w-full bg-[#1A2551] text-white"
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className="w-full px-6 md:px-12 lg:px-20 pt-12 md:pt-20 lg:pt-24">
        <div className="max-w-[1600px] mx-auto">

          {/* Massive Branding Header - SVG for Perfect Width Fit */}
          <div className="w-full mb-12 md:mb-16" aria-hidden="true">
            <svg viewBox="0 0 112 14" className="w-full h-auto block opacity-90">
              <text
                x="50%"
                y="11"
                textAnchor="middle"
                fill="currentColor"
                fontFamily="'Playfair Display', serif"
                fontSize="13.2"
                className="tracking-[-0.03em]"
              >
                Bartlett & Partners
              </text>
            </svg>
            <span className="sr-only">Bartlett & Partners</span>
          </div>

          {/* Main Content Layout - Full Width Links Only */}
          <div className="w-full mb-12 lg:mb-16">

            {/* Navigation Links (Full Width - Flex Row) */}
            <div className="w-full flex flex-row justify-between gap-2 md:gap-4 lg:gap-8">

              {/* Col 0: Newsletter */}
              <div className="flex flex-col w-full md:w-[30%] max-w-sm">
                <h3 className="text-lg font-medium mb-6 md:mb-8" style={{ fontFamily: "'Figtree', sans-serif" }}>
                  Newsletter
                </h3>
                <p className="text-white/60 text-sm mb-6 font-light leading-relaxed" style={{ fontFamily: "'Figtree', sans-serif" }}>
                  Join our exclusive mailing list for the latest property news, market analysis, and off-market opportunities.
                </p>
                {isSubmitted ? (
                  <p className="text-green-400 text-sm">Thanks for subscribing!</p>
                ) : (
                  <form onSubmit={handleNewsletterSubmit} className="flex flex-col gap-3">
                    <input
                      type="text"
                      placeholder="Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full bg-transparent border border-[#8E8567] text-white px-4 py-2 rounded-md placeholder:text-white/60 focus:outline-none focus:ring-1 focus:ring-[#8E8567] transition-all text-sm"
                      style={{ fontFamily: "'Figtree', sans-serif" }}
                    />
                    <input
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full bg-transparent border border-[#8E8567] text-white px-4 py-2 rounded-md placeholder:text-white/60 focus:outline-none focus:ring-1 focus:ring-[#8E8567] transition-all text-sm"
                      style={{ fontFamily: "'Figtree', sans-serif" }}
                    />
                    <button
                      type="submit"
                      className="w-full bg-[#8E8567] text-white border-none rounded-md py-2 text-sm font-medium hover:bg-[#7d755a] transition-colors"
                      style={{ fontFamily: "'Figtree', sans-serif" }}
                    >
                      Subscribe
                    </button>
                  </form>
                )}
              </div>

              {/* Col 1: Company */}
              <div className="flex flex-col">
                <h3 className="text-lg font-medium mb-6 md:mb-8" style={{ fontFamily: "'Figtree', sans-serif" }}>
                  Company
                </h3>
                <ul className="space-y-3 md:space-y-4">
                  <li>
                    <a href="#" onClick={(e) => handleNavClick(e, '/')} className="text-white/60 hover:text-white transition-colors text-sm">
                      Home
                    </a>
                  </li>
                  <li>
                    <a href="#" onClick={(e) => handleNavClick(e, '/properties')} className="text-white/60 hover:text-white transition-colors text-sm">
                      Properties
                    </a>
                  </li>
                  <li>
                    <a href="#" onClick={(e) => handleNavClick(e, '/about')} className="text-white/60 hover:text-white transition-colors text-sm">
                      About Us
                    </a>
                  </li>
                  <li>
                    <a href="#" onClick={(e) => handleNavClick(e, '/insights')} className="text-white/60 hover:text-white transition-colors text-sm">
                      Insights
                    </a>
                  </li>
                  <li>
                    <a href="#" onClick={(e) => handleNavClick(e, '/contact')} className="text-white/60 hover:text-white transition-colors text-sm">
                      Contact
                    </a>
                  </li>
                </ul>
              </div>

              {/* Col 2: Explore */}
              <div className="flex flex-col">
                <h3 className="text-lg font-medium mb-6 md:mb-8" style={{ fontFamily: "'Figtree', sans-serif" }}>
                  Explore
                </h3>
                <ul className="space-y-3 md:space-y-4">
                  <li>
                    <a href="#" onClick={(e) => handleNavClick(e, '/twickenham')} className="text-white/60 hover:text-white transition-colors text-sm flex items-center gap-2 group">
                      Twickenham
                      <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </a>
                  </li>
                  <li>
                    <a href="#" onClick={(e) => handleNavClick(e, '/teddington')} className="text-white/60 hover:text-white transition-colors text-sm flex items-center gap-2 group">
                      Teddington
                      <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </a>
                  </li>
                  <li>
                    <a href="#" onClick={(e) => handleNavClick(e, '/kew')} className="text-white/60 hover:text-white transition-colors text-sm flex items-center gap-2 group">
                      Kew
                      <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </a>
                  </li>
                  <li>
                    <a href="#" onClick={(e) => handleNavClick(e, '/ham')} className="text-white/60 hover:text-white transition-colors text-sm flex items-center gap-2 group">
                      Ham
                      <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </a>
                  </li>
                </ul>
              </div>

              {/* Col 3: Enquire */}
              <div className="flex flex-col">
                <h3 className="text-lg font-medium mb-6 md:mb-8" style={{ fontFamily: "'Figtree', sans-serif" }}>
                  Enquire
                </h3>
                <ul className="space-y-3 md:space-y-4">
                  <li>
                    <a href="#" onClick={(e) => handleNavClick(e, '/properties')} className="text-white/60 hover:text-white transition-colors text-sm">
                      Buying
                    </a>
                  </li>
                  <li>
                    <a href="#" onClick={(e) => handleNavClick(e, '/contact')} className="text-white/60 hover:text-white transition-colors text-sm">
                      Selling
                    </a>
                  </li>
                  <li>
                    <a href="#" onClick={(e) => handleNavClick(e, '/contact')} className="text-white/60 hover:text-white transition-colors text-sm">
                      Both
                    </a>
                  </li>
                  <li>
                    <a href="#" onClick={(e) => handleNavClick(e, '/contact')} className="text-white/60 hover:text-white transition-colors text-sm">
                      Other
                    </a>
                  </li>
                </ul>
              </div>

              {/* Col 4: Social */}
              <div className="flex flex-col">
                <h3 className="text-lg font-medium mb-6 md:mb-8" style={{ fontFamily: "'Figtree', sans-serif" }}>
                  Social
                </h3>
                <ul className="space-y-3 md:space-y-4">
                  <li>
                    <a
                      href="https://www.instagram.com/bartlettandpartners"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/60 hover:text-white transition-colors text-sm flex items-center gap-2 group"
                      onClick={() => trackEvent('click', 'Social', 'Instagram')}
                    >
                      Instagram
                      <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.facebook.com/bartlettandpartners"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/60 hover:text-white transition-colors text-sm flex items-center gap-2 group"
                      onClick={() => trackEvent('click', 'Social', 'Facebook')}
                    >
                      Facebook
                      <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.linkedin.com/company/bartlettandpartners/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/60 hover:text-white transition-colors text-sm flex items-center gap-2 group"
                      onClick={() => trackEvent('click', 'Social', 'LinkedIn')}
                    >
                      LinkedIn
                      <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </a>
                  </li>
                </ul>
              </div>

              {/* Col 5: Find Us */}
              <div className="flex flex-col">
                <h3 className="text-lg font-medium mb-6 md:mb-8" style={{ fontFamily: "'Figtree', sans-serif" }}>
                  Find Us
                </h3>
                <ul className="space-y-3 md:space-y-4">
                  <li>
                    <a
                      href="https://www.rightmove.co.uk/property-for-sale/find/Bartlett-and-Partners---Luxury-Real-Estate-Consultancy/Covering-Richmond-upon-Thames.html?locationIdentifier=BRANCH%5E239564&includeSSTC=true&_includeSSTC=on"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/60 hover:text-white transition-colors text-sm flex items-center gap-2 group"
                      onClick={() => trackEvent('click', 'Find Us', 'Rightmove')}
                    >
                      Rightmove
                      <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.zoopla.co.uk/find-agents/branch/bartlett-and-partners-richmond-126269/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/60 hover:text-white transition-colors text-sm flex items-center gap-2 group"
                      onClick={() => trackEvent('click', 'Find Us', 'Zoopla')}
                    >
                      Zoopla
                      <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.primelocation.com/find-agents/branch/bartlett-and-partners-richmond-126269/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/60 hover:text-white transition-colors text-sm flex items-center gap-2 group"
                      onClick={() => trackEvent('click', 'Find Us', 'Prime Location')}
                    >
                      Prime Location
                      <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </a>
                  </li>
                </ul>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="w-full px-6 md:px-12 lg:px-20 pb-12 md:pb-10 lg:pb-12">
        <div className="max-w-[1600px] mx-auto border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-0">

            {/* Left: Copyright */}
            <div>
              <p className="text-xs text-white/40 font-light" style={{ fontFamily: "'Figtree', sans-serif" }}>
                © 2025 Bartlett & Partners. All rights reserved.
              </p>
            </div>

            {/* Right: Legal Links */}
            <div className="flex gap-8">
              <a href="#" onClick={(e) => handleNavClick(e, '/privacy-policy')} className="text-xs text-white/40 hover:text-white transition-colors" style={{ fontFamily: "'Figtree', sans-serif" }}>Privacy Policy</a>
              <a href="#" onClick={(e) => handleNavClick(e, '/cookie-policy')} className="text-xs text-white/40 hover:text-white transition-colors" style={{ fontFamily: "'Figtree', sans-serif" }}>Cookie Policy</a>
            </div>

          </div>
        </div>
      </div>
      {/* Mobile Spacer to clear sticky CTA */}
      <div className="h-20 md:hidden" aria-hidden="true" />
    </footer >
  );
}