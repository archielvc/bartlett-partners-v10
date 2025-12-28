import { useEffect } from "react";
import { applySEO } from "../utils/seo";
import { motion } from "motion/react";
import { Mail, Phone, MessageCircle, MapPin } from "lucide-react";
import { useSiteSettings } from "../contexts/SiteContext";

import { UnifiedContactForm } from "../components/forms";
import { trackPhoneClick, trackEmailClick } from '../utils/analytics';

export default function Contact() {
  const { images } = useSiteSettings();

  useEffect(() => {
    applySEO('contact');
  }, []);

  return (
    <main id="main-content">


      <section className="w-full bg-white pt-32 md:pt-40 pb-20 px-6 md:px-12 lg:px-20">
        <div className="max-w-[1600px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0. rounded-[40px] overflow-hidden shadow-2xl border-2 border-[#1A2551]">

              {/* Left Column - Dark Navy Info Panel */}
              <div className="lg:col-span-5 bg-[#1A2551] text-white p-6 md:p-16 lg:p-20 relative overflow-hidden order-last lg:order-first">
                {/* Decorative circle */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#8E8567]/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#8E8567]/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>

                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div>
                    <h2
                      className="text-3xl md:text-4xl mb-12 text-white"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      Get in Touch
                    </h2>

                    <div className="space-y-8">
                      {/* Email */}
                      <a
                        href="mailto:info@bartlettandpartners.com"
                        onClick={() => trackEmailClick('info@bartlettandpartners.com')}
                        className="flex items-start gap-4 group"
                      >
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-[#8E8567] transition-colors duration-300">
                          <Mail className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-[#8E8567] text-xs font-bold uppercase tracking-widest mb-1" style={{ fontFamily: "'Figtree', sans-serif" }}>Email</p>
                          <p className="text-lg font-light group-hover:text-[#8E8567] transition-colors" style={{ fontFamily: "'Figtree', sans-serif" }}>info@bartlettandpartners.com</p>
                        </div>
                      </a>

                      {/* Phone */}
                      <a
                        href="tel:02086141441"
                        onClick={() => trackPhoneClick('02086141441')}
                        className="flex items-start gap-4 group"
                      >
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-[#8E8567] transition-colors duration-300">
                          <Phone className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-[#8E8567] text-xs font-bold uppercase tracking-widest mb-1" style={{ fontFamily: "'Figtree', sans-serif" }}>Phone</p>
                          <p className="text-lg font-light group-hover:text-[#8E8567] transition-colors" style={{ fontFamily: "'Figtree', sans-serif" }}>020 8614 1441</p>
                        </div>
                      </a>

                      {/* WhatsApp */}
                      <a
                        href="https://wa.me/442086141441"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start gap-4 group"
                      >
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-[#8E8567] transition-colors duration-300">
                          <MessageCircle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-[#8E8567] text-xs font-bold uppercase tracking-widest mb-1" style={{ fontFamily: "'Figtree', sans-serif" }}>WhatsApp</p>
                          <p className="text-lg font-light group-hover:text-[#8E8567] transition-colors" style={{ fontFamily: "'Figtree', sans-serif" }}>020 8614 1441</p>
                        </div>
                      </a>

                      {/* Address */}
                      <a
                        href="https://www.google.com/maps/search/?api=1&query=102-104+Church+Road+Teddington+TW11+8PY"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start gap-4 group"
                      >
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-[#8E8567] transition-colors duration-300">
                          <MapPin className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-[#8E8567] text-xs font-bold uppercase tracking-widest mb-1" style={{ fontFamily: "'Figtree', sans-serif" }}>Office</p>
                          <p className="text-lg font-light group-hover:text-[#8E8567] transition-colors leading-relaxed" style={{ fontFamily: "'Figtree', sans-serif" }}>
                            102-104 Church Road,<br />Teddington TW11 8PY
                          </p>
                        </div>
                      </a>
                    </div>
                  </div>

                  {/* Hours */}
                  <div className="mt-16 pt-12 border-t border-white/10">
                    <h3
                      className="text-xl mb-6 text-white"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      Office Hours
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-white/60 font-light" style={{ fontFamily: "'Figtree', sans-serif" }}>Monday - Thursday</span>
                        <span className="text-white font-medium" style={{ fontFamily: "'Figtree', sans-serif" }}>9:00 AM - 6:00 PM</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-white/60 font-light" style={{ fontFamily: "'Figtree', sans-serif" }}>Friday</span>
                        <span className="text-white font-medium" style={{ fontFamily: "'Figtree', sans-serif" }}>9:00 AM - 4:30 PM</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-white/60 font-light" style={{ fontFamily: "'Figtree', sans-serif" }}>Saturday</span>
                        <span className="text-white font-medium" style={{ fontFamily: "'Figtree', sans-serif" }}>9:00 AM - 4:00 PM</span>
                      </div>
                      <div className="flex justify-between items-center pb-2">
                        <span className="text-white/60 font-light" style={{ fontFamily: "'Figtree', sans-serif" }}>Sunday</span>
                        <span className="text-[#8E8567] font-medium" style={{ fontFamily: "'Figtree', sans-serif" }}>Closed</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Light Form Panel */}
              <div className="lg:col-span-7 bg-[#F9FAFB] p-6 md:p-16 lg:p-20">
                <UnifiedContactForm variant="inline" />
              </div>

            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}