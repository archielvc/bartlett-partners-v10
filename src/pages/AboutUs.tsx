import { PageHeader } from "../components/global/PageHeader";

import { AboutStoryWithStats } from "../components/about/AboutStoryWithStats";
import { AboutValues } from "../components/about/AboutValues";
import { AboutApproach } from "../components/about/AboutApproach";
import { GlobalTestimonials } from "../components/global/GlobalTestimonials";
import { useEffect } from "react";
import { applySEO } from "../utils/seo";

export default function AboutUs() {
  useEffect(() => {
    applySEO('about');
  }, []);

  return (
    <div className="w-full bg-white">
      <main id="main-content" className="w-full">
        <PageHeader title="About Us" />
        <AboutStoryWithStats />
        <AboutValues />
        <AboutApproach />



        {/* Testimonials - Wrapper removed to eliminate grey background */}
        <GlobalTestimonials />

      </main>
    </div>
  );
}