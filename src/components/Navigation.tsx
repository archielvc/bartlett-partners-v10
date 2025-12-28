import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { X, Menu, Heart, Instagram, Facebook, Linkedin } from "lucide-react";
import { useFavorites } from "../contexts/FavoritesContext";
import { useSiteSettings } from "../contexts/SiteContext";
import { FavoritesSheet } from "./FavoritesSheet";
import { BookEvaluationDialog } from "./BookEvaluationDialog";
import { PropertyInquiryDialog } from "./PropertyInquiryDialog";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { trackEvent, trackNavigation, trackCTAClick } from "../utils/analytics";

const MotionLink = motion(Link);

interface NavigationProps {
  currentPage?: string;
}

export function Navigation({ currentPage = 'home' }: NavigationProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isPastHero, setIsPastHero] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const openScrollRef = useRef(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { favorites } = useFavorites();
  const { images } = useSiteSettings();

  const blueLogo = images.branding.brand_logo_dark;
  const whiteLogo = images.branding.brand_logo_white;

  // Detect current page from URL
  const getCurrentPage = () => {
    const path = location.pathname;
    if (path === '/' || path === '/home' || path === '') return 'home';
    if (path.startsWith('/properties/')) return 'propertyDetail';
    if (path.startsWith('/blog/')) return 'blogPost';
    if (path === '/properties') return 'properties';
    if (path === '/about') return 'about';
    if (path === '/insights') return 'insights';
    if (path === '/contact') return 'contact';
    if (path === '/privacy-policy') return 'privacyPolicy';
    if (path === '/cookie-policy') return 'cookiePolicy';
    return 'home';
  };

  const actualCurrentPage = getCurrentPage();

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1000);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Optimized Scroll detection using requestAnimationFrame
  useEffect(() => {
    let rafId: number | null = null;

    const handleScroll = () => {
      if (rafId) return;

      rafId = requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        const viewportHeight = window.innerHeight;
        const width = window.innerWidth;

        const scrolled = currentScrollY > 50;
        setIsScrolled(scrolled);

        // Calculate dynamic hero height based on page
        let heroHeight = viewportHeight; // Default 100vh
        const heroElement = document.getElementById('hero-section');

        if (heroElement) {
          heroHeight = heroElement.offsetHeight;
        } else {
          // Fallback estimates if ID is missing
          const isMd = width >= 768;

          if (actualCurrentPage === 'properties' || actualCurrentPage === 'insights') {
            heroHeight = viewportHeight * (isMd ? 0.8 : 0.7);
          } else if (actualCurrentPage === 'about') {
            heroHeight = viewportHeight * (isMd ? 0.9 : 0.6);
          }
        }

        // Trigger "past hero" state when we're near the bottom of the hero
        // This ensures the navigation switches color before it hits the white background
        const threshold = Math.max(0, heroHeight - 80);
        const pastHero = currentScrollY > threshold;
        setIsPastHero(pastHero);

        if (isMenuOpen && !isMobile) {
          const diff = Math.abs(currentScrollY - openScrollRef.current);
          if (diff > 100 || currentScrollY < 50) {
            setIsMenuOpen(false);
          }
        }

        rafId = null;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isMobile, isMenuOpen, actualCurrentPage]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobile) {
      if (isMenuOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobile, isMenuOpen]);

  const handleNavigate = (page: string) => {
    const target = page.toLowerCase();
    trackNavigation(target);
    setIsMenuOpen(false);
  };

  const handleMenuToggle = () => {
    if (!isMenuOpen) {
      openScrollRef.current = window.scrollY;
    }
    setIsMenuOpen(!isMenuOpen);
  };

  const hasDarkHero = ['home'].includes(actualCurrentPage);
  const textColor = hasDarkHero ? 'text-white' : 'text-[#1A2551]';
  const hoverColor = hasDarkHero ? 'hover:text-white/70' : 'hover:text-[#1A2551]/70';

  // Styles - Optimized for Mobile (lg:hover)
  const navLinkStyle = {
    fontFamily: "'Figtree', sans-serif",
    fontSize: "0.75rem",
    textTransform: "uppercase" as const,
    letterSpacing: "0.2em",
    fontWeight: 500,
  };

  // Removed default hover:shadow-md to prevent sticky hover on mobile
  const buttonBaseStyles = "relative w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm lg:hover:shadow-md active:scale-95";

  // Common Style - Matches new card scheme (White Bg, Dark Text, Blue Border)
  const commonButtonStyle = "bg-white border border-[#1A2551] text-[#1A2551] lg:hover:bg-[#1A2551] lg:hover:text-white shadow-sm";

  const getButtonStyle = () => {
    // Mobile Menu Open: Force high visibility dark styling
    if (isMobile && isMenuOpen) {
      return commonButtonStyle;
    }
    return commonButtonStyle; // Always use the new "Card Scheme" style
  };

  const getPrimaryButtonStyle = () => {
    return commonButtonStyle; // Always use the new "Card Scheme" style
  };

  const buttonStyle = getButtonStyle();
  const primaryButtonStyle = getPrimaryButtonStyle();

  // Mobile View
  if (isMobile) {
    const showBlueLogo = isMenuOpen || (!hasDarkHero) || (hasDarkHero && isPastHero);

    return (
      <>
        <nav className={`${isMenuOpen ? 'fixed' : 'absolute'} top-4 sm:top-6 left-6 md:left-12 lg:left-20 z-[70] flex items-center pointer-events-auto`}>
          <Link
            to="/"
            onClick={() => handleNavigate('home')}
            className="cursor-pointer transition-opacity hover:opacity-80"
            aria-label="Home"
          >
            <motion.img
              key={showBlueLogo ? "blue" : "white"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              src={showBlueLogo ? blueLogo : whiteLogo}
              alt="Bartlett & Partners"
              style={{ height: "clamp(3.75rem, 11vw, 5.5rem)", width: "auto" }}
            />
          </Link>
        </nav>

        <nav className="fixed top-4 sm:top-6 right-6 md:right-12 lg:right-20 z-[70] mt-2 sm:mt-3 md:mt-5 pointer-events-auto">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Static button, no animation to prevent flickering/glitching */}
            <button
              onClick={() => {
                trackEvent('click', 'Favorites', 'mobile_header');
                setIsFavoritesOpen(true);
              }}
              className={`${buttonBaseStyles} ${buttonStyle} `}
              aria-label="View favorites"
            >
              <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
              {favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#DC2626] text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                  {favorites.length}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                trackEvent('click', 'Menu', isMenuOpen ? 'close' : 'open');
                handleMenuToggle();
              }}
              // Use active state for mobile feedback instead of hover
              className={`${buttonBaseStyles} ${buttonStyle} `}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>
        </nav>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }} // Fast, simple fade
              className="fixed inset-0 z-[60] bg-white flex flex-col"
              style={{ touchAction: "none" }} // Prevent bounce scrolling
            >
              {/* Ultra-lightweight background blobs - NO BLUR, just gradients */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -right-[10%] w-[80vw] h-[80vw] rounded-full bg-[radial-gradient(circle,rgba(142,133,103,0.1)_0%,rgba(255,255,255,0)_70%)]" />
                <div className="absolute top-[40%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-[radial-gradient(circle,rgba(26,37,81,0.05)_0%,rgba(255,255,255,0)_70%)]" />
              </div>

              <div className="flex-1 flex flex-col justify-center px-8 relative z-10 pt-32 sm:pt-40 md:pt-48 pb-12">
                <div className="flex flex-col gap-6">
                  {['Properties', 'About', 'Insights', 'Contact'].map((item, index) => (
                    <MotionLink
                      key={item}
                      to={item.toLowerCase() === 'login' ? '/admin' : (item.toLowerCase() === 'home' ? '/' : `/${item.toLowerCase()}`)}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: 0.1 + (index * 0.05), // Staggered
                        duration: 0.3,
                        ease: "easeOut"
                      }}
                      onClick={() => handleNavigate(item.toLowerCase())}
                      className="group flex items-center gap-4 text-left"
                    >
                      <span className="w-12 h-[1px] bg-[#1A2551]/20 group-hover:bg-[#8E8567] group-hover:w-20 transition-all duration-500"></span>
                      <span
                        className="text-[#1A2551] text-4xl font-medium group-hover:text-[#8E8567] transition-colors duration-500"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                      >
                        {item}
                      </span>
                    </MotionLink>
                  ))}
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="mt-auto pt-12"
                >
                  <div className="bg-white border border-[#1A2551]/10 rounded-3xl p-6 shadow-xl">
                    <div className="flex flex-col gap-3">
                      <BookEvaluationDialog
                        trigger={
                          <button
                            className="w-full bg-[#1A2551] border border-[#1A2551] text-white py-3 rounded-2xl flex items-center justify-center px-6 group transition-all shadow-sm active:scale-95 hover:bg-[#1A2551]/90"
                            onClick={() => trackCTAClick('Book Valuation', 'mobile_menu')}
                          >
                            <span className="font-bold uppercase tracking-wider text-sm" style={{ fontFamily: "'Figtree', sans-serif" }}>
                              Book Valuation
                            </span>
                          </button>
                        }
                      />

                      <PropertyInquiryDialog
                        trigger={
                          <button
                            className="w-full bg-[#8E8567] border border-[#8E8567] text-white py-3 rounded-2xl flex items-center justify-center px-6 group transition-all active:scale-95 hover:bg-[#8E8567]/90"
                            onClick={() => trackCTAClick('Enquire', 'mobile_menu')}
                          >
                            <span className="font-bold uppercase tracking-wider text-sm" style={{ fontFamily: "'Figtree', sans-serif" }}>
                              Enquire
                            </span>
                          </button>
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between mt-6 pt-6 border-t border-[#1A2551]/10">
                      <div className="flex gap-4">
                        <a
                          href="https://www.instagram.com/bartlettandpartners"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#1A2551]/40 hover:text-[#1A2551] transition-colors"
                          onClick={() => trackEvent('click', 'Social', 'Instagram')}
                        >
                          <Instagram className="w-5 h-5" />
                        </a>
                        <a
                          href="https://www.facebook.com/bartlettandpartners"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#1A2551]/40 hover:text-[#1A2551] transition-colors"
                          onClick={() => trackEvent('click', 'Social', 'Facebook')}
                        >
                          <Facebook className="w-5 h-5" />
                        </a>
                        <a
                          href="https://www.linkedin.com/company/bartlettandpartners/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#1A2551]/40 hover:text-[#1A2551] transition-colors"
                          onClick={() => trackEvent('click', 'Social', 'LinkedIn')}
                        >
                          <Linkedin className="w-5 h-5" />
                        </a>
                      </div>
                      <span className="text-[#1A2551]/40 text-xs font-medium" style={{ fontFamily: "'Figtree', sans-serif" }}>
                        London, UK
                      </span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <FavoritesSheet
          isOpen={isFavoritesOpen}
          onClose={() => setIsFavoritesOpen(false)}
          onInquire={() => {
            setIsFavoritesOpen(false);
            setIsInquiryOpen(true);
          }}
        />

        <PropertyInquiryDialog
          open={isInquiryOpen}
          onOpenChange={setIsInquiryOpen}
          properties={favorites}
          isMultiProperty={true}
        />
      </>
    );
  }

  // Desktop View
  return (
    <>
      <nav className="absolute top-0 left-0 right-0 z-40 pointer-events-none">
        <div className="px-6 md:px-12 lg:px-20">
          <div className="w-full max-w-[1600px] mx-auto">
            <div className="relative flex items-center justify-between py-8">
              <div className="flex items-center gap-12 pointer-events-auto">
                <Link
                  to="/"
                  onClick={() => handleNavigate('home')}
                  className="cursor-pointer transition-opacity hover:opacity-80 flex-shrink-0 z-10"
                  aria-label="Home"
                >
                  <img
                    src={hasDarkHero && !isPastHero ? whiteLogo : blueLogo}
                    alt="Bartlett & Partners"
                    className="logo-shimmer"
                    style={{ height: "5rem" }}
                  />
                </Link>

                <div className={`flex items-center gap-8 transition-opacity duration-300 ${isScrolled ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                  {['Properties', 'About', 'Insights', 'Contact'].map((item) => (
                    <Link
                      key={item}
                      to={item.toLowerCase() === 'login' ? '/admin' : `/${item.toLowerCase()}`}
                      onClick={() => handleNavigate(item.toLowerCase())}
                      className={`${textColor} ${hoverColor} transition-colors cursor-pointer group`}
                      style={{
                        fontFamily: "'Figtree', sans-serif",
                        fontSize: "0.75rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.2em",
                        fontWeight: 500,
                      }}
                    >
                      <span className="premium-hover relative" data-text={item}>
                        <span>{item}</span>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
        <div className="px-6 md:px-12 lg:px-20">
          <div className="w-full max-w-[1600px] mx-auto">
            <div className="flex justify-end py-8 mt-5">
              <div className="flex items-center gap-4 pointer-events-auto">

                <div className="relative flex flex-col items-center">
                  <motion.div layout transition={{ type: "spring", stiffness: 300, damping: 30 }} className="z-50">
                    <BookEvaluationDialog
                      trigger={
                        <Button
                          variant="ghost"
                          className="bg-white border border-[#1A2551] text-[#1A2551] hover:bg-[#1A2551] hover:text-white transition-colors font-bold"
                          premium
                          onClick={() => trackCTAClick('Book Valuation', 'desktop_header')}
                        >
                          Book Valuation
                        </Button>
                      }
                    />
                  </motion.div>

                  <AnimatePresence>
                    {isMenuOpen && (
                      <motion.div
                        className="absolute top-full left-0 right-0 pt-3 flex flex-col gap-3 z-40"
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={{
                          hidden: { opacity: 0 },
                          visible: {
                            opacity: 1,
                            transition: {
                              staggerChildren: 0.06,
                            }
                          },
                          exit: {
                            opacity: 0,
                            transition: {
                              duration: 0.2,
                              staggerChildren: 0.04,
                              staggerDirection: -1,
                              when: "afterChildren"
                            }
                          }
                        }}
                      >
                        {['Properties', 'About', 'Insights', 'Contact'].map((item) => (
                          <motion.div
                            key={item}
                            variants={{
                              hidden: { y: -10, opacity: 0, filter: "blur(5px)" },
                              visible: { y: 0, opacity: 1, filter: "blur(0px)" },
                              exit: { y: -10, opacity: 0, filter: "blur(5px)" }
                            }}
                            className="w-full"
                          >
                            <Button
                              variant="ghost"
                              size="default"
                              className="bg-white border border-[#1A2551] text-[#1A2551] hover:bg-[#1A2551] hover:text-white transition-colors justify-center"
                              premium={true}
                              asChild
                            >
                              <Link
                                to={item.toLowerCase() === 'login' ? '/admin' : `/${item.toLowerCase()}`}
                                onClick={() => handleNavigate(item.toLowerCase())}
                              >
                                <span className="premium-hover !inline-flex items-center justify-center gap-2">
                                  {item}
                                </span>
                              </Link>
                            </Button>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <motion.div layout transition={{ type: "spring", stiffness: 300, damping: 30 }}>
                  <button
                    onClick={() => {
                      trackEvent('click', 'Favorites', 'desktop_header');
                      setIsFavoritesOpen(true);
                    }}
                    className={`${buttonBaseStyles} ${buttonStyle}`}
                    aria-label="View favorites"
                  >
                    <Heart className="w-5 h-5" />
                    {favorites.length > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#DC2626] text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                        {favorites.length}
                      </span>
                    )}
                  </button>
                </motion.div>

                <AnimatePresence mode="popLayout">
                  {(isScrolled || isMenuOpen) && (
                    <motion.div
                      initial={{ width: 0, opacity: 0, scale: 0.5 }}
                      animate={{ width: "auto", opacity: 1, scale: 1 }}
                      exit={{ width: 0, opacity: 0, scale: 0.5 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      layout
                    >
                      <button
                        onClick={() => {
                          trackEvent('click', 'Menu', isMenuOpen ? 'close' : 'open');
                          handleMenuToggle();
                        }}
                        className={`${buttonBaseStyles} ${buttonStyle} ml-0`}
                        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                        aria-expanded={isMenuOpen}
                      >
                        {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            </div>
          </div>
        </div>
      </div>

      <FavoritesSheet
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        onInquire={() => {
          setIsFavoritesOpen(false);
          setIsInquiryOpen(true);
        }}
      />

      <PropertyInquiryDialog
        open={isInquiryOpen}
        onOpenChange={setIsInquiryOpen}
        properties={favorites}
        isMultiProperty={true}
      />
    </>
  );
}
