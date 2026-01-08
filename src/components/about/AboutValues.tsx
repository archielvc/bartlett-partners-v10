import { motion } from "motion/react";
import { ImageWithFallback } from "../ui/ImageWithFallback";
import { useSiteSettings } from "../../contexts/SiteContext";

export function AboutValues() {
  const { images } = useSiteSettings();

  const values = [
    {
      title: "Our Story",
      subtitle: "Quality Over Quantity",
      description: "After two decades in high-street agencies, founder Darren Bartlett grew frustrated with an industry that treats clients as numbers. Properties sat on the market for months. Communication was poor. Junior staff handled viewings. Sellers felt forgotten.\n\nIn 2020, he launched Bartlett & Partners with a simple promise: work with fewer clients and deliver exceptional results for each one.\n\nToday, that promise remains at the heart of everything we do. When you instruct us, you work directly with our directors throughout your entire journey. We are available on WhatsApp, we attend every viewing personally and we keep you informed at every stage.\n\nThe result? Homes that sell faster, for better prices, with far less stress.",
      image: images.about.a_story_img
    },
    {
      title: "Our Service",
      subtitle: "The Art of Silence",
      description: "In a property market saturated with noise, we believe in the power of discretion when selling homes in Twickenham and Teddington. Not every buyer needs to see your property online. Not every sale needs to be broadcast across every portal. For many of our clients selling properties in Richmond upon Thames, privacy isn't a luxury. It's a necessity. We've built a carefully curated network of qualified buyers actively seeking properties in Twickenham and Teddington, often securing sales before a home ever reaches the open market. Quiet doesn't mean slow. It means strategic, considered, and effective property sales.",
      image: images.about.a_val_1
    },
    {
      title: "Dedicated Focus",
      subtitle: "Dedicated Focus",
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
    <section className="w-full bg-white border-t border-[#1A2551]/10">
      {values.map((value, index) => (
        <div
          key={index}
          className="flex flex-col md:flex-row w-full md:h-[600px] lg:h-[700px] md:sticky bg-white shadow-xl"
          style={{
            top: 0,
            zIndex: index + 1
          }}
        >

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
          <div className={`w-full md:w-1/2 flex flex-col justify-center p-12 md:p-16 lg:p-20 bg-white overflow-hidden ${index % 2 !== 0 ? 'md:order-1' : ''}`}>
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
                className="text-[#1A2551] text-4xl md:text-5xl mb-8 font-light"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {value.subtitle}
              </h3>
              <div className="text-[#1A2551]/60 text-lg font-light leading-relaxed space-y-4">
                {value.description.split('\n\n').map((paragraph, pIndex, arr) => (
                  <p key={pIndex} className={pIndex === arr.length - 1 && index === 0 ? 'font-medium' : ''}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </motion.div>
          </div>

        </div>
      ))}
    </section>
  );
}
