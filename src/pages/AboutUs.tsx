import { PageHeader } from "../components/global/PageHeader";

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
  useEffect(() => {
    applySEO('about');
  }, []);

  return (
    <div className="w-full bg-white">
      <main id="main-content" className="w-full">
        <PageHeader title="About Us" />
        <AboutStory />
        <AboutStats />
        <AboutValues />
        <AboutApproach />



        {/* Testimonials - Wrapper removed to eliminate grey background */}
        <GlobalTestimonials />

      </main>
    </div>
  );
}