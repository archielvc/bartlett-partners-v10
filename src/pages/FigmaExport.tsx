import { useState } from "react";
import { Navigation } from "../components/Navigation";
import { Hero } from "../components/Hero";
import { PropertyShowcase } from "../components/PropertyShowcase";
import { BrandStory } from "../components/BrandStory";
import { TrustStats } from "../components/TrustStats";
import { ClientTestimonials } from "../components/ClientTestimonials";
import { CTASection } from "../components/CTASection";
import { Footer } from "../components/Footer";
import { PropertyCard } from "../components/PropertyCard";
import { WhoWeAreScrollSection } from "../components/WhoWeAreScrollSection";
import { HowWeDoIt } from "../components/HowWeDoIt";
import { TestimonialsCarousel } from "../components/TestimonialsCarousel";
import { properties } from "../data/properties";
import { testimonials } from "../data/testimonials";
import { Button } from "../components/ui/button";

const components = [
  { id: "navigation", name: "Navigation", component: <div className="relative min-h-[100px] bg-gray-100"><Navigation /></div> },
  { id: "hero", name: "Hero (Home)", component: <Hero /> },
  { id: "property-showcase", name: "Property Showcase", component: <PropertyShowcase /> },
  { id: "brand-story", name: "Brand Story", component: <BrandStory /> },
  { id: "trust-stats", name: "Trust Stats", component: <TrustStats /> },
  { id: "client-testimonials", name: "Client Testimonials", component: <ClientTestimonials /> },
  { id: "testimonials-carousel", name: "Testimonials Carousel", component: <TestimonialsCarousel testimonials={testimonials} /> },
  { id: "cta-section", name: "CTA Section", component: <CTASection /> },
  { id: "how-we-do-it", name: "How We Do It", component: <HowWeDoIt /> },
  { id: "who-we-are", name: "Who We Are", component: <WhoWeAreScrollSection /> },
  { id: "footer", name: "Footer", component: <Footer /> },
  { 
    id: "property-card", 
    name: "Property Card (Single)", 
    component: (
      <div className="p-12 max-w-md mx-auto bg-gray-50">
        <PropertyCard 
          property={{
            ...properties[0],
            id: properties[0].id,
            price: `£${properties[0].price.toLocaleString()}`,
            priceValue: Number(properties[0].price),
            beds: properties[0].beds || 0,
            baths: properties[0].baths || 0,
            sqft: properties[0].sqft?.toLocaleString() || '0',
            type: properties[0].property_type || 'Property',
            tags: []
          }} 
        />
      </div>
    ) 
  },
];

export default function FigmaExport() {
  const [selectedComponent, setSelectedComponent] = useState(components[0]);

  return (
    <div className="flex h-screen w-full overflow-hidden font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col flex-shrink-0 z-50 shadow-lg">
        <div className="p-6 border-b border-gray-200 bg-[#1A2551] text-white">
          <h1 className="text-lg font-bold">Figma Export</h1>
          <p className="text-xs opacity-70 mt-1">Select a component to preview</p>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          <div className="space-y-1">
            {components.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedComponent(item)}
                className={`w-full text-left px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                  selectedComponent.id === item.id
                    ? "bg-[#1A2551] text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <a href="/" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
             &larr; Back to Site
          </a>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-gray-100 overflow-auto flex flex-col relative">
        {/* Toolbar */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center sticky top-0 z-40">
          <h2 className="text-sm font-semibold text-gray-900">
            Previewing: {selectedComponent.name}
          </h2>
          <div className="text-xs text-gray-500">
            Width: 100% | Background: Auto
          </div>
        </div>

        {/* Component Container */}
        <div className="flex-1">
          {selectedComponent.component}
        </div>
      </div>
    </div>
  );
}