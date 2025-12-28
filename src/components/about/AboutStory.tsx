import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { trackCTAClick } from "../../utils/analytics";

import { motion } from "motion/react";
import { ImageWithFallback } from "../ui/ImageWithFallback";
import { useSiteSettings } from "../../contexts/SiteContext";

export function AboutStory() {
  const { images } = useSiteSettings();

  return (
    <section className="w-full bg-white py-32 relative overflow-hidden">
      {/* Giant Background Watermark */}
      <div className="absolute top-1/2 -translate-y-1/2 left-0 text-[40vw] font-serif leading-none text-[#F5F5F5] pointer-events-none select-none opacity-50">
        10
      </div>

      <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-20 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-20">

          {/* Text Block */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-5/12"
          >
            <div className="flex items-center gap-4 mb-8">
              <span className="text-[#8E8567] text-sm uppercase tracking-[0.2em] font-bold">Our Story</span>
            </div>

            <h2
              className="text-[#1A2551] text-5xl md:text-6xl lg:text-7xl leading-[0.9] mb-10 font-light"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Quality Over <br /> <span className="italic text-[#8E8567]">Quantity</span>
            </h2>

            <div className="space-y-6 text-[#1A2551]/70 text-lg font-light leading-relaxed">
              <p>
                After two decades in high-street agencies, founder Darren Bartlett grew frustrated with an industry that treats clients as numbers. Properties sat on the market for months. Communication was poor. Junior staff handled viewings. Sellers felt forgotten.
              </p>
              <p>
                In 2020, he launched Bartlett & Partners with a simple promise: work with fewer clients and deliver exceptional results for each one.
              </p>
              <p>
                Today, that promise remains at the heart of everything we do. When you instruct us, you work directly with our directors throughout your entire journey. We are available on WhatsApp, we attend every viewing personally and we keep you informed at every stage.
              </p>
            </div>
          </motion.div>

          {/* Image Composition */}
          <div className="w-full lg:w-7/12 relative">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative z-10 ml-auto w-[85%] aspect-[3/4]"
            >
              <ImageWithFallback
                src={images.about.a_story_img}
                alt="Luxury Interior Detail"
                className="w-full h-full object-cover shadow-2xl"
              />
            </motion.div>

            {/* Overlapping decorative element */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="absolute top-12 -left-12 w-1/2 aspect-square bg-[#1A2551] p-12 flex items-center justify-center shadow-2xl hidden md:flex z-20"
            >
              <div className="text-white text-4xl font-serif italic text-center leading-tight">
                "We treat your home as our only asset."
              </div>
            </motion.div>
          </div>

        </div>

        {/* Split Conclusion & CTA Section */}
        <div className="mt-20 pt-10 border-t border-[#1A2551]/10">
          <div className="flex flex-col gap-12">

            {/* Top: Conclusion - Full Width */}
            <div className="w-full">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-[#1A2551] text-2xl md:text-3xl font-light italic leading-relaxed"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                The result? Homes that sell faster, for better prices, with far less stress.
              </motion.p>
            </div>


          </div>
        </div>
      </div>
    </section>
  );
}