import { WhoWeAreScrollSection } from "./WhoWeAreScrollSection";
import { HowWeDoIt } from "./HowWeDoIt";

export function BrandStory() {
  return (
    <div className="w-full">
      {/* WHO WE ARE - Scroll-jacked section */}
      <WhoWeAreScrollSection />

      {/* HOW WE DO IT - Simple alternating sections */}
      <HowWeDoIt />
    </div>
  );
}