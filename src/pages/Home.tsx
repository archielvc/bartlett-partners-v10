import { HomeHero } from '../components/home/HomeHero';
import { HomeFeaturedProperties } from '../components/home/HomeFeaturedProperties';
import { ExploreBoroughs } from '../components/ExploreBoroughs';

import { HomeServicesNew } from '../components/home/HomeServicesNew';
import { HomeTeam } from '../components/home/HomeTeam';
import { GlobalTestimonials } from '../components/global/GlobalTestimonials';
import { useEffect } from 'react';
import { applySEO, injectSchema, SchemaGenerator } from '../utils/seo';
export function Home() {
  useEffect(() => {
    applySEO('home');
    injectSchema(SchemaGenerator.organization());
  }, []);

  return (
    <main className="w-full bg-white">
      <HomeHero />

      <HomeFeaturedProperties />

      <ExploreBoroughs />

      <HomeTeam />

      <HomeServicesNew />

      <GlobalTestimonials />
    </main>
  );
}