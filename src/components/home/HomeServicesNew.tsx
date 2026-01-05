import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Camera,
    Handshake,
    BarChart3,
    Megaphone,
    Armchair,
    FileText,
    ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

// --- Media Query Hook ---
function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        const media = window.matchMedia(query);
        if (media.matches !== matches) {
            setMatches(media.matches);
        }
        const listener = () => setMatches(media.matches);
        media.addEventListener('change', listener);
        return () => media.removeEventListener('change', listener);
    }, [matches, query]);

    return matches;
}

// --- Types & Data ---

interface Service {
    id: string;
    title: string;
    shortTitle: string;
    icon: React.ElementType;
    description: string;
}

const SERVICES: Service[] = [
    {
        id: 'staging',
        title: 'Preparation & Staging',
        shortTitle: 'Staging',
        icon: Armchair,
        description: 'First impressions sell homes. We advise on presentation, decluttering and styling to showcase your property at its absolute best. For select properties, we arrange professional staging to maximise buyer appeal.',
    },
    {
        id: 'photography',
        title: 'Photography & Media',
        shortTitle: 'Photography',
        icon: Camera,
        description: 'Magazine-quality photography and cinematic video tours that capture the character of your home. Our in-house media team produces content that stops buyers mid-scroll and books viewings.',
    },
    {
        id: 'marketing',
        title: 'Marketing & Promotion',
        shortTitle: 'Marketing',
        icon: Megaphone,
        description: 'Your property is promoted across Rightmove, Zoopla and our 30,000+ social media following. We also tap into our private network of registered buyers, often matching properties before they hit the open market.',
    },
    {
        id: 'viewings',
        title: 'Viewings & Negotiation',
        shortTitle: 'Negotiation',
        icon: Handshake,
        description: 'Every viewing is conducted by a company director. We know your property intimately and can answer any question a buyer might have. When offers come in, we negotiate strategically to secure you the best possible terms.',
    },
    {
        id: 'transactions',
        title: 'Transaction Management',
        shortTitle: 'Transactions',
        icon: FileText,
        description: 'We manage your sale from offer acceptance to key handover. Regular updates, proactive problem-solving and liaison with solicitors mean you are never left wondering what is happening.',
    },
    {
        id: 'analysis',
        title: 'Market Analysis',
        shortTitle: 'Analysis',
        icon: BarChart3,
        description: 'Accurate pricing sells properties faster and for more money. We provide evidence-based valuations using current market data, recent comparable sales and our deep knowledge of Richmond, Twickenham and Teddington.',
    },
];

const THEME = {
    bg: '#ffffff', // White background
    cardBg: '#1a2442', // Slightly lighter navy
    textMain: '#ffffff',
    textMuted: '#94a3b8',
    accent: '#C5A059', // Muted Gold/Bronze
};

// --- Components ---

export function HomeServicesNew() {
    const [activeId, setActiveId] = useState('staging');
    const isDesktop = useMediaQuery('(min-width: 768px)');

    return (
        <section
            className="relative min-h-screen w-full flex flex-col items-center justify-center px-6 md:px-12 lg:px-20 py-20 overflow-hidden font-sans"
            style={{ backgroundColor: THEME.bg }}
        >
            <div className="w-full max-w-[1600px] mx-auto">
                {/* Header Section */}
                <div className="w-full mb-12 text-left">
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-sm tracking-[0.2em] font-bold uppercase mb-4"
                        style={{ color: '#8E8567' }}
                    >
                        The Difference
                    </motion.p>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl text-[#1A2551]"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                        The Bartlett Experience
                    </motion.h1>
                </div>

                {/* Accordion Container */}
                <div
                    className="flex flex-col md:flex-row w-full gap-4"
                    style={{ height: isDesktop ? '600px' : 'auto' }}
                >
                    {SERVICES.map((service) => (
                        <ServiceCard
                            key={service.id}
                            service={service}
                            isActive={activeId === service.id}
                            onActivate={() => setActiveId(service.id)}
                            isDesktop={isDesktop}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

interface ServiceCardProps {
    service: Service;
    isActive: boolean;
    onActivate: () => void;
    isDesktop: boolean;
}

function ServiceCard({ service, isActive, onActivate, isDesktop }: ServiceCardProps) {
    const Icon = service.icon;

    // Desktop: Use flex-grow for accordion, height 100% to fill container
    // Mobile: Fixed 300px height, no flex behavior
    const cardStyle: React.CSSProperties = isDesktop
        ? {
            backgroundColor: THEME.cardBg,
            flexGrow: isActive ? 3.5 : 0.5,
            flexShrink: 1,
            flexBasis: '0%',
            height: '100%',
        }
        : {
            backgroundColor: THEME.cardBg,
            height: isActive ? '450px' : '80px',
            flexShrink: 0,
        };

    return (
        <div
            onMouseEnter={onActivate}
            onClick={onActivate}
            className="relative rounded-3xl overflow-hidden cursor-pointer border border-white/5 bg-[#1a2442] transition-[flex-grow] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
            style={cardStyle}
        >
            {/* Background Glow - Absolute */}
            <div
                className={`absolute inset-0 pointer-events-none z-0 transition-opacity duration-700 ${isActive ? 'opacity-100' : 'opacity-0'}`}
            >
                <div
                    className="absolute inset-0"
                    style={{
                        background: `radial-gradient(circle at 60% 50%, ${THEME.accent}30 0%, transparent 60%)`,
                        filter: 'blur(40px)',
                    }}
                />
            </div>


            {/* Main Container for static elements like Icon */}
            {/* Note: Icon position is absolute to allow content to fade in/out underneath if needed, but fixed position is stable */}
            <div className="relative z-10 w-full h-full p-8 pointer-events-none">

                <div className={`absolute left-8 transition-all duration-500 ${!isDesktop && !isActive ? 'top-1/2 -translate-y-1/2' : 'top-8'}`}>
                    <div
                        className={`p-3 rounded-full border border-white/10 ${isActive ? 'bg-white/5' : 'bg-transparent'} transition-colors duration-500`}
                    >
                        <Icon size={24} color={isActive ? THEME.accent : 'white'} />
                    </div>
                </div>

            </div>

            {/* ACTIVE CONTENT - Absolutely positioned to decouple from layout flow */}
            <div
                className={`absolute left-8 right-8 bottom-8 z-20 flex flex-col gap-6 transition-all duration-500 delay-100 
                ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
            >
                <h2 className="text-2xl md:text-4xl lg:text-5xl text-white leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {service.title}
                </h2>

                <div className="w-12 h-[1px]" style={{ backgroundColor: THEME.accent }}></div>

                <p className="text-base md:text-lg leading-relaxed text-gray-300 font-light pr-8" style={{ fontFamily: "'Figtree', sans-serif" }}>
                    {service.description}
                </p>

                <div className="mt-4 pt-4">
                    <Link
                        to="/contact"
                        className="group flex items-center gap-4 text-xs tracking-[0.2em] uppercase font-bold text-white w-fit pointer-events-auto"
                    >
                        Enquire
                        <span className="p-2 rounded-full border border-white/20 group-hover:bg-white group-hover:text-[#121b38] transition-all duration-300">
                            <ArrowRight size={16} />
                        </span>
                    </Link>
                </div>
            </div>

            {/* INACTIVE CONTENT (Vertical Label) - Abolutely positioned center */}
            <div
                className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${isActive ? 'opacity-0 pointer-events-none' : 'opacity-100 delay-200'}`}
            >
                <h3
                    className="text-sm tracking-[0.25em] font-medium text-white/60 whitespace-nowrap uppercase hidden md:block"
                    style={{
                        writingMode: 'vertical-rl',
                        textOrientation: 'mixed',
                        transform: 'rotate(180deg)',
                    }}
                >
                    {service.shortTitle}
                </h3>
                <h3 className="text-xl text-white md:hidden">
                    {service.shortTitle}
                </h3>
            </div>

        </div>
    );
}
