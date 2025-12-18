import { Property } from "../types/property";
import { PropertyCard } from "./PropertyCard";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { AnimatedText, AnimatedStagger, AnimatedStaggerItem } from "./AnimatedText";
import { useState, useEffect } from 'react';
import { getPublishedProperties } from '../utils/database';

function Content() {
  return (
    <div className="content-stretch flex flex-col font-normal gap-[16px] sm:gap-[24px] items-center relative shrink-0 text-[#1A2551] text-center w-full" data-name="Content">
      <AnimatedText delay={0}>
        <p className="font-['Playfair_Display',_serif] leading-[1.2] relative shrink-0 tracking-[-0.6px] w-full px-4" style={{ fontSize: 'clamp(1.75rem, 6vw, 3.75rem)', fontWeight: 400 }}>Featured Properties</p>
      </AnimatedText>
    </div>
  );
}

function SectionTitle() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-center max-w-[768px] relative shrink-0 w-full" data-name="Section Title">
      <Content />
    </div>
  );
}

function PortfolioList() {
  const [properties, setProperties] = useState<Property[]>([]);

  useEffect(() => {
    const fetchProperties = async () => {
      const data = await getPublishedProperties();
      setProperties(data.slice(0, 3)); // Show only first 3 properties
    };

    fetchProperties();
  }, []);

  return (
    <AnimatedStagger stagger={0.15} delay={0.1} className="content-stretch grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[24px] md:gap-[32px] items-stretch relative shrink-0 w-full" data-name="Portfolio List">
      {properties.map((property) => (
        <AnimatedStaggerItem key={property.id}>
          <PropertyCard property={property} />
        </AnimatedStaggerItem>
      ))}
    </AnimatedStagger>
  );
}

function Actions1() {
  const navigate = useNavigate();
  return (
    <AnimatedText delay={0.2}>
      <div className="flex justify-center mb-12 sm:mb-14">
        <Button 
          size="lg" 
          variant="outline" 
          className="border-2 border-[#1A2551] text-[#1A2551] hover:bg-[#1A2551] hover:text-white cursor-pointer" 
          onClick={() => navigate('/properties')}
        >
          <span className="premium-hover" data-text="View all properties">
            <span>View all properties</span>
          </span>
        </Button>
      </div>
    </AnimatedText>
  );
}

function Content2() {
  return (
    <div className="content-stretch flex flex-col gap-[64px] items-center relative shrink-0 w-full" data-name="Content">
      <PortfolioList />
      <Actions1 />
    </div>
  );
}

function Container() {
  return (
    <div className="content-stretch flex flex-col gap-[80px] items-center max-w-[1600px] relative shrink-0 w-full" data-name="Container">
      <SectionTitle />
      <Content2 />
    </div>
  );
}

export function PropertyShowcase() {
  return (
    <div className="bg-white relative w-full" data-name="Portfolio / 11 /">
      <div className="flex flex-col items-center w-full">
        <div className="box-border content-stretch flex flex-col gap-[48px] sm:gap-[64px] lg:gap-[80px] items-center px-8 md:px-10 lg:px-12 py-10 sm:py-12 lg:py-16 relative w-full">
          <Container />
        </div>
      </div>
    </div>
  );
}