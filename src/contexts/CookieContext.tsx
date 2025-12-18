import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  posthogOptIn,
  posthogOptOut,
  isPostHogLoaded
} from '../utils/analytics';

type CookieConsent = {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
};

type CookieContextType = {
  isSettingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
  isBannerVisible: boolean;
  setBannerVisible: (visible: boolean) => void;
  consent: CookieConsent;
  savePreferences: (newConsent: CookieConsent) => void;
  acceptAll: () => void;
  rejectAll: () => void;
};

const CookieContext = createContext<CookieContextType | undefined>(undefined);

export function CookieProvider({ children }: { children: React.ReactNode }) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isBannerVisible, setBannerVisible] = useState(false);

  // Lazy initialization to set the correct state immediately on mount
  const [consent, setConsent] = useState<CookieConsent>(() => {
    if (typeof window === 'undefined') {
      return {
        necessary: true,
        analytics: false,
        marketing: false,
      };
    }

    const storedConsent = localStorage.getItem("cookie-consent-preferences");
    if (storedConsent) {
      try {
        return JSON.parse(storedConsent);
      } catch (e) {
        console.error("Failed to parse cookie consent", e);
      }
    }

    return {
      necessary: true,
      analytics: false,
      marketing: false,
    };
  });

  useEffect(() => {
    // Only check for banner visibility if we don't have stored consent
    const storedConsent = localStorage.getItem("cookie-consent-preferences");
    if (!storedConsent) {
      const timer = setTimeout(() => setBannerVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Effect to handle the "functional" part of enabling scripts
  useEffect(() => {
    // Handle PostHog Analytics
    if (consent.analytics) {
      console.log("✅ Analytics cookies accepted - PostHog tracking enabled");

      // Wait a bit for PostHog to initialize if it hasn't yet
      const timer = setTimeout(() => {
        if (isPostHogLoaded()) {
          posthogOptIn();
          console.log("✅ PostHog opt-in activated");
        }
      }, 500);

      return () => clearTimeout(timer);
    } else {
      console.log("❌ Analytics cookies rejected - PostHog tracking disabled");

      // Opt out of PostHog if it's loaded
      if (isPostHogLoaded()) {
        posthogOptOut();
        console.log("✅ PostHog opt-out activated");
      }
    }

    // Handle Marketing cookies (Facebook Pixel, etc.)
    if (consent.marketing) {
      console.log("✅ Marketing cookies accepted");
      // Example: window.fbq?.('consent', 'grant');
    } else {
      console.log("❌ Marketing cookies rejected");
    }

    // If you have a logged in user, this is where you would sync to the database
    // Example: 
    // if (user) {
    //   updateUserPreferences(user.id, { cookieConsent: consent });
    // }
  }, [consent]);

  const savePreferences = (newConsent: CookieConsent) => {
    const finalConsent = { ...newConsent, necessary: true }; // Always true
    setConsent(finalConsent);
    localStorage.setItem("cookie-consent-preferences", JSON.stringify(finalConsent));
    localStorage.setItem("cookie-consent", "custom");
    setBannerVisible(false);
    setIsSettingsOpen(false);
  };

  const acceptAll = () => {
    const allConsent = { necessary: true, analytics: true, marketing: true };
    savePreferences(allConsent);
    localStorage.setItem("cookie-consent", "accepted");
  };

  const rejectAll = () => {
    const rejectConsent = { necessary: true, analytics: false, marketing: false };
    savePreferences(rejectConsent);
    localStorage.setItem("cookie-consent", "rejected");
  };

  const openSettings = () => setIsSettingsOpen(true);
  const closeSettings = () => setIsSettingsOpen(false);

  return (
    <CookieContext.Provider value={{
      isSettingsOpen,
      openSettings,
      closeSettings,
      isBannerVisible,
      setBannerVisible,
      consent,
      savePreferences,
      acceptAll,
      rejectAll
    }}>
      {children}
    </CookieContext.Provider>
  );
}

export function useCookie() {
  const context = useContext(CookieContext);
  if (context === undefined) {
    throw new Error('useCookie must be used within a CookieProvider');
  }
  return context;
}
