import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Armchair, Camera, Megaphone, Handshake, FileText, TrendingUp, ArrowRight, Plus } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { Reveal } from "../animations/Reveal";

export function HomeExperience() {
    const [activeIndex, setActiveIndex] = useState(0);
    const navigate = useNavigate();

    const services = [
        {
            icon: <Armchair className="w-5 h-5 lg:w-6 lg:h-6" />,
            title: "Preparation & Staging",
            shortTitle: "Staging",
            description: "First impressions sell homes. We advise on presentation, decluttering and styling to showcase your property at its absolute best. For select properties, we arrange professional staging to maximise buyer appeal.",
            period: "Week 1-2"
        },
        {
            icon: <Camera className="w-5 h-5 lg:w-6 lg:h-6" />,
            title: "Photography & Media",
            shortTitle: "Photography",
            description: "Magazine-quality photography and cinematic video tours that capture the character of your home. Our in-house media team produces content that stops buyers mid-scroll and books viewings.",
            period: "Week 2"
        },
        {
            icon: <Megaphone className="w-5 h-5 lg:w-6 lg:h-6" />,
            title: "Marketing & Promotion",
            shortTitle: "Marketing",
            description: "Your property is promoted across Rightmove, Zoopla and our 30,000+ social media following. We also tap into our private network of registered buyers, often matching properties before they hit the open market.",
            period: "Ongoing"
        },
        {
            icon: <Handshake className="w-5 h-5 lg:w-6 lg:h-6" />,
            title: "Viewings & Negotiation",
            shortTitle: "Negotiation",
            description: "Every viewing is conducted by a company director. We know your property intimately and can answer any question a buyer might have. When offers come in, we negotiate strategically to secure you the best possible terms.",
            period: "On Request"
        },
        {
            icon: <FileText className="w-5 h-5 lg:w-6 lg:h-6" />,
            title: "Transaction Management",
            shortTitle: "Transactions",
            description: "We manage your sale from offer acceptance to key handover. Regular updates, proactive problem-solving and liaison with solicitors mean you are never left wondering what is happening.",
            period: "Until Completion"
        },
        {
            icon: <TrendingUp className="w-5 h-5 lg:w-6 lg:h-6" />,
            title: "Market Analysis",
            shortTitle: "Analysis",
            description: "Accurate pricing sells properties faster and for more money. We provide evidence-based valuations using current market data, recent comparable sales and our deep knowledge of Richmond, Twickenham and Teddington.",
            period: "Quarterly"
        }
    ];

    // Standardized padding
    const desktopPadding = "p-12 lg:p-16";
    const mobilePadding = "p-6";

    return (
        <section className="w-full bg-white py-12 md:py-20 lg:py-32">
            <div className="w-full px-6 md:px-12 lg:px-20">
                <div className="max-w-[1600px] mx-auto">

                    {/* Section Header */}
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-8 md:mb-16 gap-8">
                        <div>
                            <Reveal>
                                <span className="text-[#8E8567] text-sm uppercase tracking-widest font-medium mb-4 block">
                                    The Difference
                                </span>
                            </Reveal>
                            <Reveal delay={0.1}>
                                <h2
                                    className="text-[#1A2551] text-4xl md:text-5xl lg:text-7xl leading-none"
                                    style={{ fontFamily: "'Playfair Display', serif" }}
                                >
                                    The Bartlett Experience
                                </h2>
                            </Reveal>
                        </div>
                    </div>

                    {/* Desktop Layout (Horizontal Accordion) */}
                    {/* Desktop Layout (Horizontal Accordion) */}
                    <div className="hidden lg:flex h-[600px] gap-4">
                        {services.map((service, index) => {
                            const isActive = index === activeIndex;
                            return (
                                <motion.div
                                    key={index}
                                    layout
                                    onClick={() => setActiveIndex(index)}
                                    className={`relative overflow-hidden cursor-pointer bg-[#1A2551] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] rounded-xl ${isActive ? "flex-[3]" : "flex-[0.5] hover:flex-[0.6] hover:bg-[#202b5c]"
                                        }`}
                                    onMouseEnter={() => setActiveIndex(index)}
                                >
                                    {/* Active State Background Elements - Subtle and Premium */}
                                    {isActive && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.8 }}
                                            className="absolute inset-0 pointer-events-none"
                                        >
                                            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#8E8567] opacity-[0.03] rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
                                            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#1A2551] opacity-10 rounded-full blur-2xl -translate-x-1/3 translate-y-1/3" />

                                            {/* Large Number Watermark */}
                                            <div
                                                className="absolute -bottom-4 right-8 text-[12rem] leading-none font-serif text-white/[0.03] font-black select-none"
                                                style={{ fontFamily: "'Playfair Display', serif" }}
                                            >
                                                {index + 1}
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Content Container */}
                                    <div className="relative h-full flex flex-col justify-end">

                                        {/* Active Content */}
                                        <AnimatePresence mode="wait">
                                            {isActive && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, transition: { duration: 0.2 } }}
                                                    transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
                                                    className={`absolute inset-0 flex flex-col justify-between ${desktopPadding}`}
                                                >
                                                    {/* Top: Icon & Title */}
                                                    <div>
                                                        <div className="w-12 h-12 rounded-full border border-[#8E8567]/30 flex items-center justify-center text-[#8E8567] mb-8">
                                                            {service.icon}
                                                        </div>
                                                        <h3 className="text-4xl lg:text-5xl text-white max-w-xl leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                                                            {service.title}
                                                        </h3>
                                                    </div>

                                                    {/* Bottom: Description & CTA */}
                                                    <div>
                                                        <div className="w-full h-px bg-white/10 mb-8" />
                                                        <div className="grid grid-cols-[2fr,1fr] gap-12 items-end">
                                                            <p className="text-white/80 text-lg font-light leading-relaxed" style={{ fontFamily: "'Figtree', sans-serif" }}>
                                                                {service.description}
                                                            </p>
                                                            <div className="flex flex-col items-start justify-end h-full">
                                                                <Link
                                                                    to="/contact"
                                                                    className="group flex items-center gap-4 text-white text-sm tracking-[0.2em] uppercase font-medium transition-all hover:text-[#8E8567]"
                                                                    onClick={() => window.scrollTo(0, 0)}
                                                                >
                                                                    <span>Enquire</span>
                                                                    <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* Inactive Content (Vertical Text) */}
                                        {!isActive && (
                                            <div className="absolute inset-0 flex items-center justify-center z-10 transition-opacity duration-300">
                                                {/* Vertical Divider Line */}
                                                <div className="absolute left-0 top-8 bottom-8 w-px bg-white/5" />

                                                <div className="rotate-[-90deg] whitespace-nowrap flex items-center gap-6">
                                                    <span className="text-white/40 text-lg tracking-wider font-light uppercase" style={{ fontFamily: "'Figtree', sans-serif" }}>
                                                        {service.shortTitle}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Mobile Layout (Vertical Stacked Accordion) */}
                    <div className="lg:hidden flex flex-col gap-3">
                        {services.map((service, index) => {
                            const isActive = index === activeIndex;
                            return (
                                <motion.div
                                    key={index}
                                    layout
                                    onClick={() => setActiveIndex(index)}
                                    className={`relative overflow-hidden cursor-pointer bg-[#1A2551] transition-all duration-500 rounded-xl ${isActive ? "py-8" : "py-6"
                                        }`}
                                >
                                    {/* Active BG Element */}
                                    {isActive && (
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#8E8567] opacity-[0.05] rounded-full blur-2xl translate-x-1/2 -translate-y-1/2" />
                                    )}

                                    {/* Header Row */}
                                    <div className={`flex items-center justify-between px-6 z-10 relative ${isActive ? "mb-6" : ""}`}>
                                        <div className="flex items-center gap-4">
                                            <h3 className={`text-xl transition-colors duration-300 ${isActive ? "text-white" : "text-white/70"}`} style={{ fontFamily: "'Playfair Display', serif" }}>
                                                {isActive ? service.title : service.shortTitle}
                                            </h3>
                                        </div>
                                        <motion.div
                                            animate={{ rotate: isActive ? 45 : 0 }}
                                            className={`text-[#8E8567] opacity-80`}
                                        >
                                            <Plus className="w-5 h-5" />
                                        </motion.div>
                                    </div>

                                    {/* Active Content */}
                                    <AnimatePresence>
                                        {isActive && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="overflow-hidden px-6"
                                            >
                                                <div className="pl-8 border-l border-white/10 ml-2">
                                                    <p className="text-white/80 text-sm font-light leading-relaxed mb-6" style={{ fontFamily: "'Figtree', sans-serif" }}>
                                                        {service.description}
                                                    </p>
                                                    <Link
                                                        to="/contact"
                                                        className="flex items-center gap-3 text-[#8E8567] text-xs tracking-widest uppercase font-bold"
                                                        onClick={() => window.scrollTo(0, 0)}
                                                    >
                                                        <span>Enquire</span>
                                                        <ArrowRight className="w-3 h-3" />
                                                    </Link>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </div>

                </div>
            </div>
        </section>
    );
}