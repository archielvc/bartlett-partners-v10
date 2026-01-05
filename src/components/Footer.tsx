import { Instagram, Facebook, Linkedin, ArrowRight } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { ImageWithFallback } from "./ui/ImageWithFallback";
import { Button } from "./ui/button";
import { useSiteSettings } from "../contexts/SiteContext";
import { trackEvent, trackNavigation, trackContactFormSubmit } from "../utils/analytics";
import { useState } from "react";
import { submitContactForm } from "../utils/database";

export function Footer() {
  const navigate = useNavigate();
  const { images } = useSiteSettings();
  // Use CMS logo if available, otherwise fallback to local logo for instant loading
  const whiteLogo = images.branding.brand_logo_white || '/logo-white.png';

  const handleNavClick = (path: string) => {
    trackNavigation(path);
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

            {/* Navigation Links (Full Width - Flexible Grid) */}
            <div className="w-full grid grid-cols-2 lg:flex lg:flex-row justify-between gap-8 md:gap-4 lg:gap-8">

              {/* Col 0: Newsletter */}
              <div className="flex flex-col col-span-2 md:col-span-1 w-full md:w-[30%] max-w-sm">
                <h3 className="text-lg font-medium mb-6 md:mb-8" style={{ fontFamily: "'Figtree', sans-serif" }}>
                  Newsletter
                </h3>
                <p className="text-white/80 text-sm mb-6 font-light leading-relaxed" style={{ fontFamily: "'Figtree', sans-serif" }}>
                  Get first-look access to new listings and off-market opportunities - often 2-3 days before they hit the portals.
                </p>
                {isSubmitted ? (
                  <div className="w-full bg-[#8E8567]/10 border border-[#8E8567] p-6 rounded-md relative overflow-hidden">
                    <div className="relative z-10">
                      <h3
                        className="text-white text-lg mb-2"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                      >
                        Thanks for subscribing
                      </h3>
                      <p
                        className="text-white/80 text-xs font-light"
                        style={{ fontFamily: "'Figtree', sans-serif" }}
                      >
                        You have successfully joined our mailing list.
                      </p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleNewsletterSubmit} className="flex flex-col gap-3">
                    <input
                      type="text"
                      placeholder="Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full bg-transparent border border-[#8E8567] text-white px-4 py-2 rounded-md placeholder:text-white/80 focus:outline-none focus:ring-1 focus:ring-[#8E8567] transition-all text-sm"
                      style={{ fontFamily: "'Figtree', sans-serif" }}
                    />
                    <input
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full bg-transparent border border-[#8E8567] text-white px-4 py-2 rounded-md placeholder:text-white/80 focus:outline-none focus:ring-1 focus:ring-[#8E8567] transition-all text-sm"
                      style={{ fontFamily: "'Figtree', sans-serif" }}
                    />
                    <button
                      type="submit"
                      className="w-full bg-[#8E8567] text-white border-none rounded-md py-2 text-sm font-medium hover:bg-[#7d755a] transition-colors"
                      style={{ fontFamily: "'Figtree', sans-serif" }}
                    >
                      Get Early Access
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
                    <Link to="/" onClick={() => handleNavClick('/')} className="text-white/80 hover:text-white transition-colors text-sm">
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link to="/properties" onClick={() => handleNavClick('/properties')} className="text-white/80 hover:text-white transition-colors text-sm">
                      Properties
                    </Link>
                  </li>
                  <li>
                    <Link to="/about" onClick={() => handleNavClick('/about')} className="text-white/80 hover:text-white transition-colors text-sm">
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link to="/insights" onClick={() => handleNavClick('/insights')} className="text-white/80 hover:text-white transition-colors text-sm">
                      Insights
                    </Link>
                  </li>
                  <li>
                    <Link to="/contact" onClick={() => handleNavClick('/contact')} className="text-white/80 hover:text-white transition-colors text-sm">
                      Contact
                    </Link>
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
                    <Link to="/twickenham" onClick={() => handleNavClick('/twickenham')} className="text-white/80 hover:text-white transition-colors text-sm flex items-center gap-2 group">
                      Twickenham
                      <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </Link>
                  </li>
                  <li>
                    <Link to="/teddington" onClick={() => handleNavClick('/teddington')} className="text-white/80 hover:text-white transition-colors text-sm flex items-center gap-2 group">
                      Teddington
                      <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </Link>
                  </li>
                  <li>
                    <Link to="/kew" onClick={() => handleNavClick('/kew')} className="text-white/80 hover:text-white transition-colors text-sm flex items-center gap-2 group">
                      Kew
                      <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </Link>
                  </li>
                  <li>
                    <Link to="/ham" onClick={() => handleNavClick('/ham')} className="text-white/80 hover:text-white transition-colors text-sm flex items-center gap-2 group">
                      Ham
                      <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </Link>
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
                    <Link to="/properties" onClick={() => handleNavClick('/properties')} className="text-white/80 hover:text-white transition-colors text-sm">
                      Buying
                    </Link>
                  </li>
                  <li>
                    <Link to="/contact" onClick={() => handleNavClick('/contact')} className="text-white/80 hover:text-white transition-colors text-sm">
                      Selling
                    </Link>
                  </li>
                  <li>
                    <Link to="/contact" onClick={() => handleNavClick('/contact')} className="text-white/80 hover:text-white transition-colors text-sm">
                      Both
                    </Link>
                  </li>
                  <li>
                    <Link to="/contact" onClick={() => handleNavClick('/contact')} className="text-white/80 hover:text-white transition-colors text-sm">
                      Other
                    </Link>
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
                      className="text-white/80 hover:text-white transition-colors text-sm flex items-center gap-2 group"
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
                      className="text-white/80 hover:text-white transition-colors text-sm flex items-center gap-2 group"
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
                      className="text-white/80 hover:text-white transition-colors text-sm flex items-center gap-2 group"
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
                      className="text-white/80 hover:text-white transition-colors text-sm flex items-center gap-2 group"
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
                      className="text-white/80 hover:text-white transition-colors text-sm flex items-center gap-2 group"
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
                      className="text-white/80 hover:text-white transition-colors text-sm flex items-center gap-2 group"
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
              <p className="text-xs text-white/70 font-light" style={{ fontFamily: "'Figtree', sans-serif" }}>
                © 2025 Bartlett & Partners. All rights reserved.
              </p>
            </div>

            {/* Right: Legal Links */}
            <div className="flex gap-8">
              <Link to="/privacy-policy" onClick={() => handleNavClick('/privacy-policy')} className="text-xs text-white/70 hover:text-white transition-colors" style={{ fontFamily: "'Figtree', sans-serif" }}>Privacy Policy</Link>
              <Link to="/cookie-policy" onClick={() => handleNavClick('/cookie-policy')} className="text-xs text-white/70 hover:text-white transition-colors" style={{ fontFamily: "'Figtree', sans-serif" }}>Cookie Policy</Link>
            </div>

          </div>
        </div>
      </div>
      {/* Mobile Spacer to clear sticky CTA */}
      <div className="h-10 md:hidden" aria-hidden="true" />
    </footer >
  );
}