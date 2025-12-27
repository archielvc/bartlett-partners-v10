import { AboutHero } from "../components/about/AboutHero";
import { Reveal } from "../components/animations/Reveal";
import { AboutStats } from "../components/about/AboutStats";
import { AboutValues } from "../components/about/AboutValues";
import { AboutApproach } from "../components/about/AboutApproach";
import { AboutStory } from "../components/about/AboutStory";
import { GlobalTestimonials } from "../components/global/GlobalTestimonials";
import { useEffect, useState } from "react";
import { applySEO } from "../utils/seo";
import { useNavigate, Link } from "react-router-dom";
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



        {/* Testimonials - Wrapper removed to eliminate grey background */}
        <Reveal width="100%">
          <GlobalTestimonials />
        </Reveal>

      </main>
    </div>
  );
}