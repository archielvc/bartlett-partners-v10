import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useCookie } from './CookieContext';
import {
  initGA,
  initClarity,
  initPostHog,
  trackPageView,
  GA_MEASUREMENT_ID,
  CLARITY_PROJECT_ID,
  POSTHOG_API_KEY,
} from '../utils/analytics';

interface AnalyticsContextType {
  isEnabled: boolean;
}

const AnalyticsContext = createContext<AnalyticsContextType>({ isEnabled: false });

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { consent } = useCookie();

  const isEnabled = consent.analytics;

  // Initialize analytics on consent
  useEffect(() => {
    if (!isEnabled) return;

    // Only initialize if IDs are configured
    if (GA_MEASUREMENT_ID && GA_MEASUREMENT_ID !== 'G-XXXXXXXXXX') {
      initGA();
    }

    if (CLARITY_PROJECT_ID && CLARITY_PROJECT_ID !== 'xxxxxxxxxx') {
      initClarity();
    }

    // PostHog - delay initialization to improve initial page load
    // Load after 2 seconds or on first user interaction
    if (POSTHOG_API_KEY && POSTHOG_API_KEY !== '') {
      const timer = setTimeout(() => {
        initPostHog();
      }, 2000);

      const handleInteraction = () => {
        clearTimeout(timer);
        initPostHog();
      };

      window.addEventListener('click', handleInteraction, { once: true });
      window.addEventListener('scroll', handleInteraction, { once: true });

      return () => {
        clearTimeout(timer);
        window.removeEventListener('click', handleInteraction);
        window.removeEventListener('scroll', handleInteraction);
      };
    }
  }, [isEnabled]);

  // Track page views on route change
  useEffect(() => {
    if (!isEnabled) return;

    // Small delay to ensure page title is updated
    const timer = setTimeout(() => {
      trackPageView(location.pathname + location.search, document.title);
    }, 100);

    return () => clearTimeout(timer);
  }, [location, isEnabled]);

  return (
    <AnalyticsContext.Provider value={{ isEnabled }}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export const useAnalytics = () => useContext(AnalyticsContext);
