import { HomeHero } from '../components/home/HomeHero';
import { HomeFeaturedProperties } from '../components/home/HomeFeaturedProperties';
import { HomeLocations } from '../components/home/HomeLocations';

import { HomeExperience } from '../components/home/HomeExperience';
import { HomeTeam } from '../components/home/HomeTeam';
import { GlobalTestimonials } from '../components/global/GlobalTestimonials';
import { useEffect } from 'react';
import { applySEO, injectSchema, SchemaGenerator } from '../utils/seo';
import { Reveal } from '../components/animations/Reveal';

export function Home() {
  useEffect(() => {
    applySEO('home');
    injectSchema(SchemaGenerator.organization());
  }, []);

  return (
    <main className="w-full bg-white">
      <HomeHero />

      <Reveal width="100%">
        <HomeFeaturedProperties />
      </Reveal>

      <Reveal width="100%">
        <HomeLocations />
      </Reveal>




      <Reveal width="100%">
        <HomeTeam />
      </Reveal>

      <Reveal width="100%">
        <HomeExperience />
      </Reveal>


      <GlobalTestimonials />
    </main>
  );
}