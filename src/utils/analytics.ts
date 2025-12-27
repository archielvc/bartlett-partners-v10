// Analytics Configuration for Google Analytics 4, Microsoft Clarity, and PostHog
import posthog from 'posthog-js';

// ============================================
// CONFIGURATION - Replace with your IDs
// ============================================

export const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX'; // Replace with your GA4 Measurement ID
export const CLARITY_PROJECT_ID = 'xxxxxxxxxx'; // Replace with your Clarity Project ID
export const POSTHOG_API_KEY = 'phc_jd9q0sygkrnsvnrcUl6WV5erGkWBigAW3DsxUQM0gP7'; // Your PostHog Project API Key
export const POSTHOG_HOST = 'https://eu.i.posthog.com'; // EU region (as per your PostHog account)

// ============================================
// GOOGLE ANALYTICS 4
// ============================================

// Check if GA is loaded
export const isGALoaded = (): boolean => {
  return typeof window !== 'undefined' && typeof window.gtag === 'function';
};

// Initialize GA4
export const initGA = (): void => {
  if (typeof window === 'undefined') return;

  // Add gtag script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: window.location.pathname,
    send_page_view: true,
  });
};

// Track page views (call on route change)
export const trackPageView = (url: string, title?: string): void => {
  if (!isGALoaded()) return;

  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: url,
    page_title: title || document.title,
  });
};

// Track custom events
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
): void => {
  if (!isGALoaded()) return;

  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

// ============================================
// PREDEFINED EVENT TRACKERS
// ============================================

// Property Events
export const trackPropertyView = (propertyId: string, propertyTitle: string, price: number): void => {
  trackEvent('view_item', 'Property', propertyTitle, price);

  // Enhanced ecommerce view_item
  if (isGALoaded()) {
    window.gtag('event', 'view_item', {
      currency: 'GBP',
      value: price,
      items: [{
        item_id: propertyId,
        item_name: propertyTitle,
        item_category: 'Property',
        price: price,
      }]
    });
  }
};

export const trackPropertyEnquiry = (propertyId: string, propertyTitle: string, price: number): void => {
  trackEvent('generate_lead', 'Property Enquiry', propertyTitle, price);

  // Track as conversion
  if (isGALoaded()) {
    window.gtag('event', 'conversion', {
      send_to: `${GA_MEASUREMENT_ID}/property_enquiry`,
      value: price,
      currency: 'GBP',
    });
  }
};

export const trackPropertyFavorited = (propertyId: string, propertyTitle: string): void => {
  trackEvent('add_to_wishlist', 'Property', propertyTitle);
};

// Contact/Lead Events
export const trackContactFormSubmit = (formType: 'general' | 'valuation' | 'property' | 'newsletter' | 'newsletter_popup_step1' | 'lead_gen_popup_step2'): void => {
  trackEvent('generate_lead', 'Contact Form', formType);

  // Track as conversion
  if (isGALoaded()) {
    window.gtag('event', 'conversion', {
      send_to: `${GA_MEASUREMENT_ID}/contact_form`,
      event_label: formType,
    });
  }
};

export const trackValuationRequest = (): void => {
  trackEvent('generate_lead', 'Valuation Request', 'Book Valuation');

  // Track as conversion (high value)
  if (isGALoaded()) {
    window.gtag('event', 'conversion', {
      send_to: `${GA_MEASUREMENT_ID}/valuation_request`,
    });
  }
};

export const trackPhoneClick = (phoneNumber: string): void => {
  trackEvent('click', 'Phone', phoneNumber);
};

export const trackEmailClick = (email: string): void => {
  trackEvent('click', 'Email', email);
};

// Navigation Events
export const trackNavigation = (destination: string): void => {
  trackEvent('navigation', 'Menu Click', destination);
};

export const trackCTAClick = (ctaName: string, location: string): void => {
  trackEvent('cta_click', location, ctaName);
};

// Blog Events
export const trackBlogView = (slug: string, title: string): void => {
  trackEvent('view_item', 'Blog Post', title);
};

export const trackBlogShare = (slug: string, platform: string): void => {
  trackEvent('share', 'Blog Post', platform);
};

// Search/Filter Events
export const trackPropertySearch = (filters: Record<string, any>): void => {
  trackEvent('search', 'Property Search', JSON.stringify(filters));
};

export const trackPropertyFilter = (filterType: string, value: string): void => {
  trackEvent('filter', 'Property Filter', `${filterType}: ${value}`);
};

// Engagement Events
export const trackScrollDepth = (percentage: number): void => {
  trackEvent('scroll', 'Page Engagement', `${percentage}%`, percentage);
};

export const trackTimeOnPage = (seconds: number): void => {
  trackEvent('timing_complete', 'Page Engagement', 'Time on Page', seconds);
};

export const trackVideoPlay = (videoTitle: string): void => {
  trackEvent('video_start', 'Video', videoTitle);
};

export const trackMapInteraction = (propertyId: string): void => {
  trackEvent('click', 'Map', propertyId);
};

// ============================================
// MICROSOFT CLARITY
// ============================================

export const initClarity = (): void => {
  if (typeof window === 'undefined') return;

  // Clarity initialization script
  (function (c: any, l: any, a: any, r: any, i: any, t?: any, y?: any) {
    c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments) };
    t = l.createElement(r); t.async = 1; t.src = "https://www.clarity.ms/tag/" + i;
    y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
  })(window, document, "clarity", "script", CLARITY_PROJECT_ID);
};

// Clarity custom tags (for segmentation)
export const claritySetTag = (key: string, value: string): void => {
  if (typeof window !== 'undefined' && window.clarity) {
    window.clarity('set', key, value);
  }
};

// Clarity identify user (for logged-in users, if applicable)
export const clarityIdentify = (userId: string, sessionId?: string, pageId?: string): void => {
  if (typeof window !== 'undefined' && window.clarity) {
    window.clarity('identify', userId, sessionId, pageId);
  }
};

// Clarity custom event
export const clarityEvent = (eventName: string): void => {
  if (typeof window !== 'undefined' && window.clarity) {
    window.clarity('event', eventName);
  }
};
// ============================================
// POSTHOG (using official posthog-js package)
// ============================================

// Check if PostHog is initialized
export const isPostHogLoaded = (): boolean => {
  return posthog.__loaded === true;
};

// Initialize PostHog
export const initPostHog = (): void => {
  if (typeof window === 'undefined') return;
  if (!POSTHOG_API_KEY) return;
  if (posthog.__loaded) return; // Already initialized

  posthog.init(POSTHOG_API_KEY, {
    api_host: POSTHOG_HOST,
    person_profiles: 'identified_only',
    capture_pageview: true,
    capture_pageleave: true,
    autocapture: true,
    opt_out_capturing_by_default: false, // Start opted-in since we only call this after consent
    loaded: () => {
      console.log('✅ PostHog initialized and ready for tracking');
    }
  });
};

// Capture custom event
export const posthogCapture = (event: string, properties?: Record<string, any>): void => {
  if (!isPostHogLoaded()) return;
  posthog.capture(event, properties);
};

// Identify user
export const posthogIdentify = (userId: string, properties?: Record<string, any>): void => {
  if (!isPostHogLoaded()) return;
  posthog.identify(userId, properties);
};

// Opt in/out (for consent management)
export const posthogOptIn = (): void => {
  if (!isPostHogLoaded()) return;
  posthog.opt_in_capturing();
};

export const posthogOptOut = (): void => {
  if (!isPostHogLoaded()) return;
  posthog.opt_out_capturing();
};

// Reset user (on logout)
export const posthogReset = (): void => {
  if (!isPostHogLoaded()) return;
  posthog.reset();
};

// ============================================
// TYPE DECLARATIONS
// ============================================

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
    clarity: (...args: any[]) => void;
  }
}
