import { motion } from "motion/react";
import { ImageWithFallback } from "../ui/ImageWithFallback";
import { useSiteSettings } from "../../contexts/SiteContext";

export function AboutValues() {
  const { images } = useSiteSettings();

  const values = [
    {
      title: "Our Service",
      subtitle: "The Art of Silence",
      description: "In a property market saturated with noise, we believe in the power of discretion when selling homes in Twickenham and Teddington. Not every buyer needs to see your property online. Not every sale needs to be broadcast across every portal. For many of our clients selling properties in Richmond upon Thames, privacy isn't a luxury. It's a necessity. We've built a carefully curated network of qualified buyers actively seeking properties in Twickenham and Teddington, often securing sales before a home ever reaches the open market. Quiet doesn't mean slow. It means strategic, considered, and effective property sales.",
      image: images.about.a_val_1
    },
    {
      title: "Quality over Quantity",
      subtitle: "Quality over Quantity",
      description: "The best buyers aren't found by casting the widest net. They're found through targeted outreach, market intelligence, and relationships built over years in the Twickenham and Teddington property market. By working with just 10 clients at a time, we can dedicate the attention needed to truly understand your home, identify the right buyers, and negotiate from a position of strength. Your property deserves more than to be just another listing. It deserves to be a priority.",
      image: images.about.a_val_2
    },
    {
      title: "Relentless Pursuit",
      subtitle: "Relentless Pursuit",
      description: "Selling a property in Twickenham or Teddington isn't a passive exercise. It requires persistence, insight, and an unwavering commitment to achieving the result you deserve. We don't wait for buyers to come to us. We find them. Through our established network, strategic property marketing, and deep understanding of the local property market in Richmond upon Thames, we connect exceptional homes with the right people. Every viewing is prepared for. Every offer is scrutinised. Every negotiation is handled with your best interests at heart.",
      image: images.about.a_val_3
    }
  ];

  return (
    <section className="w-full bg-white">
      {values.map((value, index) => (
        <div key={index} className="flex flex-col md:flex-row w-full">

          {/* Image Side */}
          <div className={`w-full md:w-1/2 h-[60vh] md:h-auto relative overflow-hidden ${index % 2 !== 0 ? 'md:order-2' : ''}`}>
            <ImageWithFallback
              src={value.image}
              alt={value.title}
              className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-[1.5s]"
            />
            <div className="absolute inset-0 bg-black/10" />
          </div>

          {/* Text Side */}
          <div className={`w-full md:w-1/2 flex flex-col justify-center p-12 md:p-24 lg:p-32 bg-white ${index % 2 !== 0 ? 'md:order-1' : ''}`}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-[#8E8567] text-sm font-bold uppercase tracking-[0.2em] mb-4 block">
                {value.title}
              </span>
              <h3
                className="text-[#1A2551] text-4xl md:text-5xl mb-8 font-serif font-light"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {value.subtitle}
              </h3>
              <p className="text-[#1A2551]/60 text-lg font-light leading-relaxed">
                {value.description}
              </p>
            </motion.div>
          </div>

        </div>
      ))}
    </section>
  );
}
