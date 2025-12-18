import { Instagram, Facebook, Linkedin, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Button } from "./ui/button";
import { useSiteSettings } from "../contexts/SiteContext";
import { trackEvent, trackNavigation, trackContactFormSubmit } from "../utils/analytics";

import { saveSubscriber, submitContactForm } from '../utils/database';

export function Footer() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const navigate = useNavigate();
  const { images } = useSiteSettings();
  const whiteLogo = images.branding.brand_logo_white;

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      return;
    }

    try {
      await submitContactForm({
        name: `${firstName} ${lastName}`.trim() || 'Newsletter Subscriber',
        email: email,
        message: 'Newsletter subscription request',
        inquiry_type: 'newsletter',
        property_id: undefined,
        propertyTitle: undefined
      });

      trackContactFormSubmit('newsletter');

      console.log("Newsletter subscription:", { firstName, lastName, email });
      setEmail("");
      setFirstName("");
      setLastName("");
    } catch (error) {
      console.error('Newsletter error:', error);
    }
  };

  const handleNavClick = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    trackNavigation(path);
    navigate(path);
    window.scrollTo(0, 0);
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

          {/* Main Content Layout - Grid 12-Col: Strict allocation to prevent overlap */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 mb-12 lg:mb-16">

            {/* Left Zone: Newsletter (4/12 cols - narrower inputs) */}
            <div className="lg:col-span-4">
              <h3 className="text-lg font-medium mb-8" style={{ fontFamily: "'Figtree', sans-serif" }}>
                Newsletter
              </h3>
              <p className="text-white/70 text-sm mb-6 font-light" style={{ fontFamily: "'Figtree', sans-serif" }}>
                Stay informed about the property market and expert insights.
              </p>

              <form onSubmit={handleSubscribe} className="flex flex-col gap-3 mb-4 w-full">
                <div className="flex flex-col gap-3">
                  {/* Name Row */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="First Name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      className="w-1/2 bg-transparent border border-[#8E8567] text-white px-4 rounded-md placeholder:text-white/60 focus:outline-none focus:ring-1 focus:ring-[#8E8567] transition-all text-sm h-10"
                      style={{ fontFamily: "'Figtree', sans-serif" }}
                    />
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      className="w-1/2 bg-transparent border border-[#8E8567] text-white px-4 rounded-md placeholder:text-white/60 focus:outline-none focus:ring-1 focus:ring-[#8E8567] transition-all text-sm h-10"
                      style={{ fontFamily: "'Figtree', sans-serif" }}
                    />
                  </div>

                  {/* Email & Button Row */}
                  <div className="flex gap-2">
                    <input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="flex-1 bg-transparent border border-[#8E8567] text-white px-4 rounded-md placeholder:text-white/60 focus:outline-none focus:ring-1 focus:ring-[#8E8567] transition-all text-sm h-11"
                      style={{ fontFamily: "'Figtree', sans-serif" }}
                    />
                    <Button
                      type="submit"
                      premium
                      className="bg-[#8E8567] text-white border-none rounded-md px-4 flex items-center justify-center transition-colors duration-300 h-11 w-12 shrink-0"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </form>

              <p className="text-[10px] text-white/40 font-light" style={{ fontFamily: "'Figtree', sans-serif" }}>
                By subscribing, you agree to our privacy policy.
              </p>
            </div>

            {/* Right Zone: Navigation Links (7/12 cols, offset by 1) */}
            <div className="lg:col-span-7 lg:col-start-6 flex flex-wrap md:flex-nowrap justify-between gap-8 lg:gap-12">

              {/* Col 2: Company */}
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

              {/* Col 3: Explore */}
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

              {/* Col: Enquire */}
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

              {/* Col: Find Us */}
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
      <div className="w-full px-6 md:px-12 lg:px-20 pb-48 md:pb-20 lg:pb-20">
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
    </footer >
  );
}