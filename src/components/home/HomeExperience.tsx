import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { OptimizedImage } from "../OptimizedImage";
import { Armchair, Camera, Megaphone, Handshake, FileText, TrendingUp, ArrowRight, Plus, Minus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Reveal } from "../animations/Reveal";
import { useSiteSettings } from "../../contexts/SiteContext";

export function HomeExperience() {
    const [activeIndex, setActiveIndex] = useState(0);
    const navigate = useNavigate();
    const { images } = useSiteSettings();

    const services = [
        {
            icon: <Armchair className="w-5 h-5 lg:w-6 lg:h-6" />,
            title: "Preparation & Staging",
            shortTitle: "Staging",
            description: "First impressions sell homes. We advise on presentation, decluttering and styling to showcase your property at its absolute best. For select properties, we arrange professional staging to maximise buyer appeal.",
            image: images.home.h_exp_staging
        },
        {
            icon: <Camera className="w-5 h-5 lg:w-6 lg:h-6" />,
            title: "Photography & Media",
            shortTitle: "Photography",
            description: "Magazine-quality photography and cinematic video tours that capture the character of your home. Our in-house media team produces content that stops buyers mid-scroll and books viewings.",
            image: images.home.h_exp_photo
        },
        {
            icon: <Megaphone className="w-5 h-5 lg:w-6 lg:h-6" />,
            title: "Marketing & Promotion",
            shortTitle: "Marketing",
            description: "Your property is promoted across Rightmove, Zoopla and our 30,000+ social media following. We also tap into our private network of registered buyers, often matching properties before they hit the open market.",
            image: images.home.h_exp_marketing
        },
        {
            icon: <Handshake className="w-5 h-5 lg:w-6 lg:h-6" />,
            title: "Viewings & Negotiation",
            shortTitle: "Negotiation",
            description: "Every viewing is conducted by a company director. We know your property intimately and can answer any question a buyer might have. When offers come in, we negotiate strategically to secure you the best possible terms.",
            image: images.home.h_exp_negotiation
        },
        {
            icon: <FileText className="w-5 h-5 lg:w-6 lg:h-6" />,
            title: "Transaction Management",
            shortTitle: "Transactions",
            description: "We manage your sale from offer acceptance to key handover. Regular updates, proactive problem-solving and liaison with solicitors mean you are never left wondering what is happening.",
            image: images.home.h_exp_trans
        },
        {
            icon: <TrendingUp className="w-5 h-5 lg:w-6 lg:h-6" />,
            title: "Market Analysis",
            shortTitle: "Analysis",
            description: "Accurate pricing sells properties faster and for more money. We provide evidence-based valuations using current market data, recent comparable sales and our deep knowledge of Richmond, Twickenham and Teddington.",
            image: images.home.h_exp_analysis
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
                                    className="text-[#1A2551] text-4xl md:text-5xl lg:text-6xl leading-none"
                                    style={{ fontFamily: "'Playfair Display', serif" }}
                                >
                                    The Bartlett Experience
                                </h2>
                            </Reveal>
                        </div>


                    </div>

                    {/* Desktop Layout (Horizontal Accordion) */}
                    <div className="hidden lg:flex h-[600px] gap-2">
                        {services.map((service, index) => {
                            const isActive = index === activeIndex;
                            return (
                                <motion.div
                                    key={index}
                                    layout
                                    onClick={() => setActiveIndex(index)}
                                    className={`relative overflow-hidden cursor-pointer rounded-sm transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${isActive ? "flex-[3]" : "flex-[0.5] hover:flex-[0.7]"
                                        }`}
                                    onMouseEnter={() => setActiveIndex(index)}
                                >
                                    {/* Background - Solid color when collapsed, image when active */}
                                    <div className="absolute inset-0 w-full h-full">
                                        {isActive ? (
                                            <>
                                                <OptimizedImage
                                                    src={service.image}
                                                    alt={service.title}
                                                    className="w-full h-full object-cover transition-transform duration-1000 scale-110"
                                                    width={1200}
                                                />
                                                <div className="absolute inset-0 bg-[#1A2551]/60" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-[#1A2551] via-transparent to-transparent opacity-90" />
                                            </>
                                        ) : (
                                            /* Solid navy for collapsed state */
                                            <div className="w-full h-full bg-[#1A2551] hover:bg-[#232d5a] transition-colors duration-300" />
                                        )}
                                    </div>

                                    {/* Active Content */}
                                    <AnimatePresence mode="wait">
                                        {isActive && (
                                            <motion.div
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.4, delay: 0.2 }}
                                                className={`absolute bottom-0 left-0 w-full z-10 ${desktopPadding}`}
                                            >
                                                <div className="bg-[#8E8567] w-12 h-1 mb-6" />
                                                <div className="flex items-center gap-4 text-white mb-4">
                                                    {service.icon}
                                                    <h3 className="text-3xl md:text-4xl" style={{ fontFamily: "'Playfair Display', serif" }}>
                                                        {service.title}
                                                    </h3>
                                                </div>
                                                <p className="text-white/90 text-lg font-light leading-relaxed max-w-lg mb-8" style={{ fontFamily: "'Figtree', sans-serif" }}>
                                                    {service.description}
                                                </p>

                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate('/contact');
                                                    }}
                                                    className="flex items-center gap-3 text-white text-sm tracking-widest uppercase font-medium group hover:text-[#8E8567] transition-colors"
                                                >
                                                    <span>Enquire</span>
                                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Inactive Content (Vertical Text) */}
                                    {!isActive && (
                                        <div className="absolute inset-0 flex items-center justify-center z-10">
                                            <div className="rotate-[-90deg] whitespace-nowrap flex items-center gap-4">
                                                <span className="text-white/90 text-xl tracking-wider font-medium" style={{ fontFamily: "'Playfair Display', serif" }}>
                                                    {service.shortTitle}
                                                </span>
                                            </div>
                                            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50">
                                                <Plus className="w-6 h-6" />
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Mobile Layout (Vertical Stacked Accordion - Matching Desktop Design) */}
                    <div className="lg:hidden flex flex-col h-[600px] gap-2">
                        {services.map((service, index) => {
                            const isActive = index === activeIndex;
                            return (
                                <motion.div
                                    key={index}
                                    layout
                                    onClick={() => setActiveIndex(index)}
                                    className={`relative overflow-hidden cursor-pointer rounded-sm transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${isActive ? "flex-[3]" : "flex-[0.5]"
                                        }`}
                                >
                                    {/* Background - Solid color when collapsed, image when active */}
                                    <div className="absolute inset-0 w-full h-full">
                                        {isActive ? (
                                            <>
                                                <OptimizedImage
                                                    src={service.image}
                                                    alt={service.title}
                                                    className="w-full h-full object-cover transition-transform duration-1000 scale-105"
                                                    width={800}
                                                />
                                                <div className="absolute inset-0 bg-[#1A2551]/60" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-[#1A2551] via-[#1A2551]/20 to-transparent opacity-90" />
                                            </>
                                        ) : (
                                            /* Solid navy for collapsed state */
                                            <div className="w-full h-full bg-[#1A2551]" />
                                        )}
                                    </div>

                                    {/* Active Content */}
                                    <AnimatePresence mode="wait">
                                        {isActive && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.3, delay: 0.1 }}
                                                className={`absolute bottom-0 left-0 w-full z-10 ${mobilePadding}`}
                                            >
                                                <div className="bg-[#8E8567] w-8 h-0.5 mb-4" />
                                                <div className="flex items-center gap-3 text-white mb-2">
                                                    {service.icon}
                                                    <h3 className="text-2xl" style={{ fontFamily: "'Playfair Display', serif" }}>
                                                        {service.title}
                                                    </h3>
                                                </div>
                                                <p className="text-white/90 text-sm font-light leading-relaxed max-w-xs mb-4" style={{ fontFamily: "'Figtree', sans-serif" }}>
                                                    {service.description}
                                                </p>

                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate('/contact');
                                                    }}
                                                    className="flex items-center gap-2 text-white text-xs tracking-widest uppercase font-bold"
                                                >
                                                    <span>Enquire</span>
                                                    <ArrowRight className="w-3 h-3" />
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Inactive Content (Horizontal Bar) */}
                                    {!isActive && (
                                        <div className="absolute inset-0 flex items-center justify-between px-6 z-10">
                                            <div className="flex items-center gap-4">
                                                <span className="text-white/70">
                                                    {service.icon}
                                                </span>
                                                <span className="text-white/90 text-base tracking-wide font-medium" style={{ fontFamily: "'Playfair Display', serif" }}>
                                                    {service.title}
                                                </span>
                                            </div>
                                            <div className="text-white/50">
                                                <Plus className="w-5 h-5" />
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>

                </div>

            </div>
        </section>
    );
}