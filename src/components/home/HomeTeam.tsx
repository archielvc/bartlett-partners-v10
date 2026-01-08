import { motion } from "motion/react";
import { OptimizedImage } from "../OptimizedImage";
import { Linkedin, Mail, Phone } from "lucide-react";
import { useSiteSettings } from "../../contexts/SiteContext";
import { trackPhoneClick, trackEmailClick } from "../../utils/analytics";
import { useState, useEffect, useRef, useCallback } from "react";
import { getTeamMembers } from "../../utils/database";
import type { TeamMember } from "../../types/database";

export function HomeTeam() {
  const { images } = useSiteSettings();
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [centredMemberId, setCentredMemberId] = useState<number | null>(null);
  const [hoveredMemberId, setHoveredMemberId] = useState<number | null>(null);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Callback ref to track card elements
  const setCardRef = useCallback((id: number, element: HTMLDivElement | null) => {
    if (element) {
      cardRefs.current.set(id, element);
    } else {
      cardRefs.current.delete(id);
    }
  }, []);

  useEffect(() => {
    async function loadTeam() {
      const members = await getTeamMembers();
      if (members.length > 0) {
        setTeam(members);
      }
      setLoading(false);
    }
    loadTeam();
  }, []);

  // Track mobile viewport for grayscale behaviour
  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    setIsMobileViewport(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setIsMobileViewport(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // IntersectionObserver for mobile centre detection
  useEffect(() => {
    // Only set up observer on mobile viewports
    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    if (!isMobile || team.length === 0) return;

    // rootMargin: -40% top and bottom means only the centre 20% of viewport triggers
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const memberId = Number(entry.target.getAttribute('data-member-id'));
            setCentredMemberId(memberId);
          }
        });
      },
      {
        rootMargin: '-40% 0px -40% 0px',
        threshold: 0,
      }
    );

    // Observe all card elements
    cardRefs.current.forEach((element) => {
      observerRef.current?.observe(element);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [team]);

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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {team.map((member, index) => {
            const isCentred = centredMemberId === member.id;
            const isHovered = hoveredMemberId === member.id;
            // Show colour on desktop hover OR when centred on mobile
            const showColour = (isHovered && !isMobileViewport) || (isCentred && isMobileViewport);
            return (
            <motion.div
              key={member.id}
              ref={(el) => setCardRef(member.id, el)}
              data-member-id={member.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -12 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.5, ease: "easeOut" }}
              className="group"
              onMouseEnter={() => setHoveredMemberId(member.id)}
              onMouseLeave={() => setHoveredMemberId(null)}
            >
              {/* Card Image */}
              <div
                className="relative aspect-[3/4] overflow-hidden bg-gray-100 mb-6 shadow-sm transition-all duration-500"
                style={{ filter: showColour ? 'grayscale(0)' : 'grayscale(1)' }}
              >
                <OptimizedImage
                  src={member.image || getDefaultImage(index)}
                  alt={member.name}
                  className="transition-transform duration-700 ease-in-out group-hover:scale-105"
                  aspectRatio="3/4"
                  enableLQIP={true}
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
            </motion.div>
          );
          })}
        </div>
      </div>
    </section>
  );
}
