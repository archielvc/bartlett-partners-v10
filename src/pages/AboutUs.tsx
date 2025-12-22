import { AboutHero } from "../components/about/AboutHero";
import { Reveal } from "../components/animations/Reveal";
import { AboutStats } from "../components/about/AboutStats";
import { AboutValues } from "../components/about/AboutValues";
import { AboutApproach } from "../components/about/AboutApproach";
import { AboutStory } from "../components/about/AboutStory";
import { GlobalTestimonials } from "../components/global/GlobalTestimonials";
import { useEffect, useState } from "react";
import { applySEO } from "../utils/seo";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { trackCTAClick } from "../utils/analytics";
import { getGlobalSettings } from "../utils/database";

export default function AboutUs() {
  const navigate = useNavigate();
  const [heroImage, setHeroImage] = useState<string | undefined>(undefined);

  useEffect(() => {
    applySEO('about');

    const fetchSettings = async () => {
      try {
        const settings = await getGlobalSettings<Record<string, string>>('page_hero_images');
        const images = settings as Record<string, string> | null;
        if (images && images.about) {
          setHeroImage(images.about);
        }
      } catch (e) {
        console.error('Failed to fetch hero image', e);
      }
    };

    fetchSettings();
  }, []);

  return (
    <div className="w-full bg-white">
      <main id="main-content" className="w-full">
        <AboutHero image={heroImage} />
        <AboutStory />
        <AboutStats />
        <AboutValues />
        <AboutApproach />

        {/* CTA Section - Moved above Testimonials */}
        <section className="w-full py-24 bg-[#1A2551] text-white text-center px-6">
          <div className="max-w-3xl mx-auto">
            <Reveal width="100%" variant="fade-in">
              <h2
                className="text-4xl md:text-5xl mb-6 leading-tight font-light"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Ready to be a priority?
              </h2>
            </Reveal>
            <Reveal width="100%" delay={0.2}>
              <p className="text-white/70 text-base md:text-lg font-light mb-10 max-w-3xl mx-auto leading-relaxed">
                Let us help you achieve exceptional results with your property sale.
              </p>
            </Reveal>
            <Reveal width="100%" delay={0.3}>
              <Button
                onClick={() => {
                  trackCTAClick('Book a Valuation', 'About Us Page');
                  navigate('/contact');
                }}
                variant="hero"
                premium
                className="mx-auto bg-white text-[#1A2551] border-none hover:bg-[#8E8567] hover:text-white"
              >
                Book a Valuation
              </Button>
            </Reveal>
          </div>
        </section>

        {/* Testimonials - Wrapper removed to eliminate grey background */}
        <Reveal width="100%">
          <GlobalTestimonials />
        </Reveal>

      </main>
    </div>
  );
}