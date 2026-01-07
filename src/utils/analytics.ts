// Analytics Configuration for Google Analytics 4 and PostHog
// PostHog is lazy-loaded to reduce initial bundle size (162KB saved)

// ============================================
// CONFIGURATION - Replace with your IDs
// ============================================

export const GA_MEASUREMENT_ID = 'G-WEZ5YMVB83';
export const POSTHOG_API_KEY = 'phc_jd9q0sygkrnsvnrcUl6WV5erGkWBigAW3DsxUQM0gP7'; // Your PostHog Project API Key
export const POSTHOG_HOST = 'https://eu.i.posthog.com'; // EU region (as per your PostHog account)

// Lazy-loaded PostHog instance
let posthog: typeof import('posthog-js').default | null = null;
let isPostHogInitialized = false;
let postHogLoadPromise: Promise<void> | null = null;

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
// POSTHOG (lazy-loaded for performance)
// ============================================

// Check if PostHog is initialized
export const isPostHogLoaded = (): boolean => {
  return isPostHogInitialized && posthog !== null;
};

// Load PostHog library dynamically
const loadPostHog = async (): Promise<void> => {
  if (posthog) return;

  if (postHogLoadPromise) {
    return postHogLoadPromise;
  }

  postHogLoadPromise = (async () => {
    const { default: PostHog } = await import('posthog-js');
    posthog = PostHog;
  })();

  return postHogLoadPromise;
};

// Initialize PostHog (lazy loads the library first)
export const initPostHog = async (): Promise<void> => {
  if (typeof window === 'undefined') return;
  if (!POSTHOG_API_KEY) return;
  if (isPostHogInitialized) return;

  try {
    await loadPostHog();

    if (!posthog) return;

    posthog.init(POSTHOG_API_KEY, {
      api_host: POSTHOG_HOST,
      person_profiles: 'identified_only',
      capture_pageview: true,
      capture_pageleave: true,
      autocapture: true,
      opt_out_capturing_by_default: false,
      loaded: () => {
        console.log('✅ PostHog lazy-loaded and initialized');
        isPostHogInitialized = true;
      }
    });
  } catch (error) {
    console.error('Failed to load PostHog:', error);
  }
};

// Capture custom event (auto-initializes if needed)
export const posthogCapture = async (event: string, properties?: Record<string, any>): Promise<void> => {
  if (!isPostHogLoaded()) {
    await initPostHog();
  }
  if (posthog && isPostHogInitialized) {
    posthog.capture(event, properties);
  }
};

// Identify user
export const posthogIdentify = async (userId: string, properties?: Record<string, any>): Promise<void> => {
  if (!isPostHogLoaded()) {
    await initPostHog();
  }
  if (posthog && isPostHogInitialized) {
    posthog.identify(userId, properties);
  }
};

// Opt in/out (for consent management)
export const posthogOptIn = async (): Promise<void> => {
  if (!isPostHogLoaded()) {
    await initPostHog();
  }
  if (posthog && isPostHogInitialized) {
    posthog.opt_in_capturing();
  }
};

export const posthogOptOut = async (): Promise<void> => {
  if (!isPostHogLoaded()) return; // Don't load just to opt out
  if (posthog) {
    posthog.opt_out_capturing();
  }
};

// Reset user (on logout)
export const posthogReset = (): void => {
  if (!isPostHogLoaded()) return;
  if (posthog) {
    posthog.reset();
  }
};

// ============================================
// TYPE DECLARATIONS
// ============================================

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}
