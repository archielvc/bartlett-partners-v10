import { ImageWithFallback } from "../ui/ImageWithFallback";
import { Linkedin, Mail, Phone } from "lucide-react";
import { useSiteSettings } from "../../contexts/SiteContext";
import { trackPhoneClick, trackEmailClick } from "../../utils/analytics";
import { useState, useEffect } from "react";
import { getTeamMembers } from "../../utils/database";
import type { TeamMember } from "../../types/database";
import { useScrollReveal } from "../../hooks/animations/useScrollReveal";

export function HomeTeam() {
  const { images } = useSiteSettings();
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  const containerRef = useScrollReveal({
    selector: ".team-member-card",
    stagger: 0.15,
    threshold: 0.1,
    x: -20,
    dependencies: [team]
  });

  useEffect(() => {
    async function loadTeam() {
      const members = await getTeamMembers();
      if (members.length > 0) {
        setTeam(members);
      } else {
        // Fallback or empty state if needed, but we seeded data so it should be fine.
        // If DB is empty, maybe fallback to hardcoded? 
        // For now, let's stick to DB data.
      }
      setLoading(false);
    }
    loadTeam();
  }, []);

  // Default images mapping if DB image is empty
  const getDefaultImage = (index: number) => {
    if (index === 0) return images.team.t_member_1;
    if (index === 1) return images.team.t_member_2;
    if (index === 2) return images.team.t_member_3;
    return images.team.t_member_1;
  };

  if (loading) return null; // Or a skeleton loader if preferred

  return (
    <section className="w-full bg-white py-12 md:py-20 px-6 md:px-12 lg:px-20">
      <div className="max-w-[1600px] mx-auto">
        <div className="mb-8 md:mb-16">
          <span className="block text-[#8E8567] text-sm tracking-[0.2em] font-bold uppercase mb-3" style={{ fontFamily: "'Figtree', sans-serif" }}>
            Dedicated to You
          </span>
          <h2
            className="text-[#1A2551] text-4xl md:text-5xl mb-6"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
          >
            Meet the Team
          </h2>
        </div>

        <div
          ref={containerRef as any}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12"
        >
          {team.map((member, index) => (
            <div
              key={member.id}
              className="team-member-card opacity-0 group"
            >
              {/* Card Image */}
              <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 mb-6 shadow-sm">
                <ImageWithFallback
                  src={member.image || getDefaultImage(index)}
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
                  {member.phone && (
                    <a
                      href={`tel:${member.phone.replace(/\s/g, '')}`}
                      onClick={() => trackPhoneClick(member.phone!)}
                      className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-[#1A2551] hover:bg-[#1A2551] hover:text-white transition-all duration-300 hover:shadow-md"
                      aria-label={`Call ${member.name}`}
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  )}
                  {member.email && (
                    <a
                      href={`mailto:${member.email}`}
                      onClick={() => trackEmailClick(member.email!)}
                      className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-[#1A2551] hover:bg-[#1A2551] hover:text-white transition-all duration-300 hover:shadow-md"
                      aria-label={`Email ${member.name}`}
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                  )}
                  {member.linkedin_url && (
                    <a
                      href={member.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-[#1A2551] hover:bg-[#1A2551] hover:text-white transition-all duration-300 hover:shadow-md"
                      aria-label="LinkedIn Profile"
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
