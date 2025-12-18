import { motion } from "motion/react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { Linkedin, Mail, Phone } from "lucide-react";
import { useSiteSettings } from "../../contexts/SiteContext";
import { trackPhoneClick, trackEmailClick } from "../../utils/analytics";

export function HomeTeam() {
  const { images } = useSiteSettings();

  const team = [
    {
      name: "James Bartlett",
      role: "Founder & Managing Director",
      image: images.team.t_member_1,
      bio: "With 25 years in prime London real estate, James established Bartlett & Partners to bring a private office approach to the Richmond market.",
      phone: "+44 (0) 20 8940 5555",
      email: "james@bartlett.co.uk"
    },
    {
      name: "Sarah Chen",
      role: "Head of Sales",
      image: images.team.t_member_2,
      bio: "Sarah's background in interior design and architecture gives her a unique lens for valuation and presentation of heritage properties.",
      phone: "+44 (0) 20 8940 5556",
      email: "sarah@bartlett.co.uk"
    },
    {
      name: "Marcus Thorne",
      role: "Senior Partner",
      image: images.team.t_member_3,
      bio: "Specialising in off-market transactions, Marcus manages our most discreet acquisitions with military precision.",
      phone: "+44 (0) 20 8940 5557",
      email: "marcus@bartlett.co.uk"
    }
  ];

  return (
    <section className="w-full bg-white py-12 md:py-20">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-20">
        <div className="mb-8 md:mb-16">
          <span className="block text-[#8E8567] text-sm tracking-[0.2em] font-medium uppercase mb-3" style={{ fontFamily: "'Figtree', sans-serif" }}>
            Dedicated to You
          </span>
          <h2
            className="text-[#1A2551] text-4xl md:text-5xl mb-6"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
          >
            Meet the Team
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {team.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -12 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.5, ease: "easeOut" }}
              className="group"
            >
              {/* Card Image */}
              <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 mb-6 shadow-sm">
                <ImageWithFallback
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
                />

                {/* Soft Overlay */}
                <div className="absolute inset-0 bg-[#1A2551]/0 group-hover:bg-[#1A2551]/5 transition-colors duration-500" />
              </div>

              {/* Content */}
              <div>
                <h3
                  className="text-2xl text-[#1A2551] mb-1"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {member.name}
                </h3>
                <p className="text-[#8E8567] text-sm font-medium uppercase tracking-wider mb-4">
                  {member.role}
                </p>
                <p className="text-gray-500 font-light leading-relaxed mb-6 min-h-[80px]" style={{ fontFamily: "'Figtree', sans-serif" }}>
                  {member.bio}
                </p>

                {/* Actions - Always Visible */}
                <div className="flex gap-3">
                  <a
                    href={`tel:${member.phone.replace(/\s/g, '')}`}
                    onClick={() => trackPhoneClick(member.phone)}
                    className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-[#1A2551] hover:bg-[#1A2551] hover:text-white transition-all duration-300 hover:shadow-md"
                    aria-label={`Call ${member.name}`}
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                  <a
                    href={`mailto:${member.email}`}
                    onClick={() => trackEmailClick(member.email)}
                    className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-[#1A2551] hover:bg-[#1A2551] hover:text-white transition-all duration-300 hover:shadow-md"
                    aria-label={`Email ${member.name}`}
                  >
                    <Mail className="w-4 h-4" />
                  </a>
                  <button
                    className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-[#1A2551] hover:bg-[#1A2551] hover:text-white transition-all duration-300 hover:shadow-md"
                    aria-label="LinkedIn Profile"
                  >
                    <Linkedin className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
