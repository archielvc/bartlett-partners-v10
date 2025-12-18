import { Star, ShieldCheck, Award, BadgeCheck } from "lucide-react";

export function TrustStats() {
  return (
    <section className="w-full bg-[#F5F5F5] border-y border-[#1A2551]/5 py-12">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Google Reviews */}
          <div className="flex flex-col items-center text-center">
             <div className="flex items-center gap-1 mb-3">
                <Star className="w-5 h-5 fill-[#FBBF24] text-[#FBBF24]" />
                <Star className="w-5 h-5 fill-[#FBBF24] text-[#FBBF24]" />
                <Star className="w-5 h-5 fill-[#FBBF24] text-[#FBBF24]" />
                <Star className="w-5 h-5 fill-[#FBBF24] text-[#FBBF24]" />
                <Star className="w-5 h-5 fill-[#FBBF24] text-[#FBBF24]" />
             </div>
             <div className="text-[#1A2551] font-bold text-xl mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                4.9/5 Rating
             </div>
             <div className="text-[#1A2551]/60 text-xs uppercase tracking-widest font-medium">
                Google Reviews
             </div>
          </div>

          {/* Experience */}
          <div className="flex flex-col items-center text-center">
             <Award className="w-8 h-8 text-[#8E8567] mb-3" />
             <div className="text-[#1A2551] font-bold text-xl mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                25+ Years
             </div>
             <div className="text-[#1A2551]/60 text-xs uppercase tracking-widest font-medium">
                Local Experience
             </div>
          </div>

          {/* Sold Properties */}
          <div className="flex flex-col items-center text-center">
             <BadgeCheck className="w-8 h-8 text-[#8E8567] mb-3" />
             <div className="text-[#1A2551] font-bold text-xl mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                £1.2B+
             </div>
             <div className="text-[#1A2551]/60 text-xs uppercase tracking-widest font-medium">
                Property Sold
             </div>
          </div>

          {/* Certification */}
          <div className="flex flex-col items-center text-center">
             <ShieldCheck className="w-8 h-8 text-[#8E8567] mb-3" />
             <div className="text-[#1A2551] font-bold text-xl mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                Propertymark
             </div>
             <div className="text-[#1A2551]/60 text-xs uppercase tracking-widest font-medium">
                Protected Agent
             </div>
          </div>

        </div>
      </div>
    </section>
  );
}
