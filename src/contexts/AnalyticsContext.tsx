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

  // Initialize analytics on consent - delayed to improve initial page load performance
  useEffect(() => {
    if (!isEnabled) return;

    const timers: NodeJS.Timeout[] = [];

    // Delay all analytics initialization to avoid blocking initial render
    // Load after 2 seconds or on first user interaction
    const handleInteraction = () => {
      timers.forEach(clearTimeout);
      initAllAnalytics();
    };

    const initAllAnalytics = () => {
      if (GA_MEASUREMENT_ID && GA_MEASUREMENT_ID !== 'G-XXXXXXXXXX') {
        initGA();
      }
      if (CLARITY_PROJECT_ID && CLARITY_PROJECT_ID !== 'xxxxxxxxxx') {
        initClarity();
      }
      if (POSTHOG_API_KEY && POSTHOG_API_KEY !== '') {
        initPostHog();
      }
      // Remove listeners after initialization
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('scroll', handleInteraction);
    };

    // Set timer for delayed initialization
    const timer = setTimeout(initAllAnalytics, 2000);
    timers.push(timer);

    // Initialize on first user interaction (whichever comes first)
    window.addEventListener('click', handleInteraction, { once: true });
    window.addEventListener('scroll', handleInteraction, { once: true });

    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('scroll', handleInteraction);
    };
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
