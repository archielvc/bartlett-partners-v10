import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "../ui/dialog";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { PhoneInput } from "../ui/phone-input";
import { X, ArrowRight, Check, MapPin, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useLocation } from "react-router-dom";
import { submitContactForm, updateEnquiryById } from "../../utils/database";
import { trackEvent, trackContactFormSubmit } from "../../utils/analytics";

export function TwoStepPopup() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1 = email, 2 = preferences, 3 = success
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");

  // Step 2 fields
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState<string | undefined>("");
  const [priceRange, setPriceRange] = useState("");
  const [minBeds, setMinBeds] = useState("");
  const [timeline, setTimeline] = useState("");

  // Store enquiry ID for updating
  const [enquiryId, setEnquiryId] = useState<number | null>(null);

  const [mounted, setMounted] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const location = useLocation();

  // Auto-close after 4 seconds on success screen
  useEffect(() => {
    if (step === 3) {
      const timer = setTimeout(() => {
        setOpen(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  useEffect(() => {
    setMounted(true);

    // Don't trigger if user has already subscribed
    if (localStorage.getItem("newsletter_subscribed") || sessionStorage.getItem("popup_shown")) {
      setHasTriggered(true);
      return;
    }

    // Helper: Check if any overlay is currently open
    const isOverlayOpen = () => {
      // Check for Radix UI / Shadcn Dialog/Sheet lock on body
      if (document.body.style.overflow === 'hidden') return true;
      return false;
    };

    const triggerPopup = () => {
      if (hasTriggered || localStorage.getItem("newsletter_subscribed")) return;

      // CRITICAL: Do not show if another overlay is open
      if (isOverlayOpen()) return;

      setOpen(true);
      setHasTriggered(true);

      // Only set session storage to prevent multiple triggers in same session
      // localStorage will be set AFTER successful subscription
      sessionStorage.setItem("popup_shown", "true");

      trackEvent('view_promotion', 'Lead Magnet', 'Two Step Popup');
    };

    // 1. Exit Intent (Desktop)
    const handleExitIntent = (e: MouseEvent) => {
      if (e.clientY <= 10) {
        triggerPopup();
      }
    };

    // 2. Scroll Depth (Mobile/Desktop) - 60%
    const handleScroll = () => {
      const scrollPercent = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight;

      if (scrollPercent > 0.6) {
        triggerPopup();
      }
    };

    // 3. Activity Based - Delay after 45 seconds
    const idleTimer = setTimeout(() => {
      if (!hasTriggered && !isOverlayOpen()) {
        triggerPopup();
      }
    }, 45000);

    document.addEventListener("mouseleave", handleExitIntent);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      clearTimeout(idleTimer);
      document.removeEventListener("mouseleave", handleExitIntent);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [hasTriggered, location.pathname]);

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !firstName) return;

    // Create initial enquiry and store the ID
    const id = await submitContactForm({
      name: firstName,
      email: email,
      message: 'Newsletter subscription from Two Step Popup',
      inquiry_type: 'newsletter'
    });

    if (id) {
      setEnquiryId(id);
      // Mark as subscribed - popup won't show again
      localStorage.setItem("newsletter_subscribed", "true");
    }

    trackContactFormSubmit('newsletter_popup_step1');
    setStep(2);
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all required fields
    if (!address || !phoneNumber || !timeline || !priceRange || !minBeds) return;

    // Update the existing enquiry with preferences (saved to individual columns)
    if (enquiryId) {
      await updateEnquiryById(enquiryId, {
        phone: phoneNumber,
        address: address,
        price_range: priceRange,
        min_beds: minBeds,
        timeline: timeline,
        message: 'Newsletter subscription with Priority Access'
      });
    }

    trackContactFormSubmit('lead_gen_popup_step2');
    setStep(3);
  };

  const handleNoThanks = () => {
    trackEvent('dismiss_promotion', 'Lead Magnet', 'No Thanks');
    setStep(3);
  };

  const handleClose = () => {
    setOpen(false);
    if (step === 1) {
      trackEvent('dismiss_promotion', 'Lead Magnet', 'Close Button');
    }
  };

  if (!mounted) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden bg-white/95 backdrop-blur-xl border-0 sm:border-2 border-[#1A2551] shadow-2xl rounded-none sm:rounded-3xl gap-0 [&>button]:hidden">
        <div className="relative w-full h-full">
          <DialogTitle className="sr-only">See Properties Before Rightmove</DialogTitle>
          <DialogDescription className="sr-only">
            Get exclusive first-look access to new listings and off-market opportunities.
          </DialogDescription>

          {/* Liquid Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
            <div className="absolute -top-[20%] -right-[10%] w-[500px] h-[500px] bg-[#8E8567]/10 rounded-full blur-[80px]" />
            <div className="absolute bottom-[0%] -left-[10%] w-[400px] h-[400px] bg-[#1A2551]/5 rounded-full blur-[80px]" />
          </div>

          {/* Close Button - hide on success screen */}
          {step !== 3 && (
            <button
              onClick={handleClose}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-[#1A2551]/5 flex items-center justify-center hover:bg-[#1A2551] hover:text-white transition-colors text-[#1A2551] z-50"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="p-8 md:p-12 lg:p-16">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col items-center text-center space-y-8"
                >
                  <div className="space-y-4 max-w-lg">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8E8567]/10 text-[#8E8567] text-[10px] font-bold uppercase tracking-widest">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#8E8567]" />
                      Exclusive Access
                    </div>
                    <h2
                      className="text-3xl md:text-4xl lg:text-5xl text-[#1A2551] leading-[1.1]"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      See Properties <br /> <span className="italic text-[#8E8567]">Before Rightmove</span>
                    </h2>
                    <p className="text-[#1A2551]/70 text-base md:text-lg leading-relaxed font-light">
                      Join 2,000+ Richmond locals who receive exclusive first-look access to new listings, off-market opportunities, and insider market analysis.
                    </p>
                  </div>

                  <form onSubmit={handleStep1Submit} className="w-full max-w-md space-y-4">
                    <div className="space-y-2 text-left">
                      <Label htmlFor="firstName" className="text-xs uppercase tracking-widest font-bold text-[#1A2551] ml-1">
                        First Name*
                      </Label>
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="First Name"
                        className="h-11 px-5 rounded-md border-[#1A2551]/20 bg-white/80 focus:bg-white text-base"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        autoFocus
                      />
                    </div>

                    <div className="space-y-2 text-left">
                      <Label htmlFor="email" className="text-xs uppercase tracking-widest font-bold text-[#1A2551] ml-1">
                        Email Address*
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        className="h-11 px-5 rounded-md border-[#1A2551]/20 bg-white/80 focus:bg-white text-base"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-11 rounded-md bg-[#1A2551] text-white shadow-lg shadow-[#1A2551]/20 flex items-center justify-center gap-2 mt-2"
                    >
                      <span className="premium-hover whitespace-nowrap">
                        Get Early Access
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>

                    <p className="text-[10px] text-[#1A2551]/40">
                      Unsubscribe anytime. No spam, ever.
                    </p>
                  </form>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col items-center text-center space-y-8"
                >
                  <div className="space-y-4 max-w-lg">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#15803d]/10 text-[#15803d] text-[10px] font-bold uppercase tracking-widest">
                      <Check className="w-3 h-3" />
                      Subscribed
                    </div>
                    <h2
                      className="text-3xl md:text-4xl text-[#1A2551] leading-[1.1]"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      Get <span className="italic text-[#8E8567]">Priority</span> Access
                    </h2>
                    <p className="text-[#1A2551]/70 text-sm md:text-base leading-relaxed font-light">
                      Complete your profile to receive instant alerts for properties matching your criteria - often 2-3 days before they appear on Rightmove or Zoopla.
                    </p>
                  </div>

                  <form onSubmit={handleStep2Submit} className="w-full max-w-md space-y-5">

                    <div className="space-y-2 text-left">
                      <Label htmlFor="address" className="text-[10px] uppercase tracking-widest font-bold text-[#1A2551] ml-1">
                        Current Address*
                      </Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1A2551]/40" />
                        <Input
                          id="address"
                          placeholder="Start typing your address..."
                          className="h-11 pl-10 rounded-md border-[#1A2551]/20 bg-white/80 focus:bg-white text-sm"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2 text-left">
                      <Label htmlFor="phone" className="text-[10px] uppercase tracking-widest font-bold text-[#1A2551] ml-1">
                        Phone Number*
                      </Label>
                      <PhoneInput
                        id="phone"
                        placeholder="Phone number"
                        value={phoneNumber}
                        onChange={setPhoneNumber}
                        required
                      />
                    </div>

                    <div className="space-y-2 text-left">
                      <Label className="text-[10px] uppercase tracking-widest font-bold text-[#1A2551] ml-1">
                        When Are You Looking to Move?*
                      </Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1A2551]/40 pointer-events-none z-10" />
                        <Select value={timeline} onValueChange={setTimeline} required>
                          <SelectTrigger className="h-11 w-full pl-10 rounded-md border-[#1A2551]/20 bg-white/80 text-sm">
                            <SelectValue placeholder="Select timeline" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Within 3 months">Within 3 months</SelectItem>
                            <SelectItem value="3-6 months">3-6 months</SelectItem>
                            <SelectItem value="6-12 months">6-12 months</SelectItem>
                            <SelectItem value="Just browsing">Just browsing</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-left">
                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase tracking-widest font-bold text-[#1A2551] ml-1">Price Range*</Label>
                        <Select value={priceRange} onValueChange={setPriceRange} required>
                          <SelectTrigger className="h-11 w-full rounded-md border-[#1A2551]/20 bg-white/80 text-sm">
                            <SelectValue placeholder="Any" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Under £750K">Under £750K</SelectItem>
                            <SelectItem value="£750K - £1.5M">£750K - £1.5M</SelectItem>
                            <SelectItem value="£1.5M - £2.5M">£1.5M - £2.5M</SelectItem>
                            <SelectItem value="Over £2.5M">Over £2.5M</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase tracking-widest font-bold text-[#1A2551] ml-1">Min Beds*</Label>
                        <Select value={minBeds} onValueChange={setMinBeds} required>
                          <SelectTrigger className="h-11 w-full rounded-md border-[#1A2551]/20 bg-white/80 text-sm">
                            <SelectValue placeholder="Any" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1+</SelectItem>
                            <SelectItem value="2">2+</SelectItem>
                            <SelectItem value="3">3+</SelectItem>
                            <SelectItem value="4">4+</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 pt-2">
                      <Button
                        type="submit"
                        className="w-full h-11 rounded-md bg-[#1A2551] text-white shadow-lg shadow-[#1A2551]/20"
                        premium
                      >
                        Get Priority Alerts
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={handleNoThanks}
                        className="w-full h-auto py-2 text-[#1A2551]/60 hover:text-[#1A2551] hover:bg-transparent uppercase tracking-widest text-[10px] font-bold"
                      >
                        No thanks, just the newsletter
                      </Button>
                    </div>
                  </form>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col items-center justify-center text-center py-10"
                >
                  <div className="w-20 h-20 bg-[#1A2551]/5 rounded-full flex items-center justify-center mb-6">
                    <div className="w-16 h-16 bg-[#1A2551] rounded-full flex items-center justify-center shadow-lg shadow-[#1A2551]/20">
                      <Check className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  <h3
                    className="text-2xl md:text-3xl text-[#1A2551] mb-4"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    Welcome to the Inner Circle
                  </h3>

                  <p
                    className="text-[#1A2551]/70 max-w-sm mb-8 leading-relaxed font-light"
                    style={{ fontFamily: "'Figtree', sans-serif" }}
                  >
                    You're now part of our exclusive network. Look out for early-access listings and insider market insights in your inbox.
                  </p>

                  <Button
                    onClick={() => setOpen(false)}
                    variant="outline"
                    className="min-w-[200px] shadow-lg shadow-[#1A2551]/10 bg-white text-[#1A2551] hover:bg-[#F9FAFB] border border-[#1A2551]/10"
                  >
                    Close
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
