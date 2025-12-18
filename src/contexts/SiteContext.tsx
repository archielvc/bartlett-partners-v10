import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

// Default Assets for Fallback
import blueLogo from "figma:asset/4dc31e3d4d8476a091118f1ea8f376b69a8e629a.png";
import whiteLogo from "figma:asset/a49a304c14bdb50701e6c3c6ec4ac8419c70162c.png";

// Structure matches CMSSiteImages
type ImageSection = 'branding' | 'home' | 'about' | 'contact' | 'properties' | 'insights' | 'team' | 'locations' | 'film' | 'policies';
interface ImageBlock {
  id: string;
  value: string;
  fallback?: string;
}

interface GlobalSEOSettings {
  googleAnalyticsId: string;
  heatmapId: string;
}

interface SiteContextType {
  images: Record<ImageSection, Record<string, string>>; // Simplified access: images.home.h_hero_bg
  analytics: GlobalSEOSettings;
  loading: boolean;
  refreshImages: () => Promise<void>;
}

const SiteContext = createContext<SiteContextType | undefined>(undefined);

// Defaults are now empty strings to respect user request for "no image default"
// EXCEPT logos, which need a structural fallback to avoid broken headers
const DEFAULT_IMAGES_MAP: Record<ImageSection, Record<string, string>> = {
  branding: {
    brand_logo_dark: blueLogo,
    brand_logo_white: whiteLogo
  },
  home: {
    h_exp_staging: '',
    h_exp_photo: '',
    h_exp_marketing: '',
    h_exp_negotiation: '',
    h_exp_trans: '',
    h_exp_analysis: ''
  },
  about: {
    a_hero_bg: '',
    a_story_img: '',
    a_approach_img: '',
    a_approach_decor: '',
    a_val_1: '',
    a_val_2: '',
    a_val_3: ''
  },
  contact: {
    c_hero_bg: ''
  },
  properties: {
    p_hero_bg: ''
  },
  insights: {
    i_hero_bg: ''
  },
  locations: {
    l_twickenham: '',
    l_teddington: '',
    l_kew: '',
    l_ham: '',
    l_st_margarets: ''
  },
  team: {
    t_member_1: '',
    t_member_2: '',
    t_member_3: ''
  },
  film: {
    film_hero: ''
  },
  policies: {
    privacy_hero: '',
    cookie_hero: ''
  }
};

const DEFAULT_SEO: GlobalSEOSettings = {
  googleAnalyticsId: '',
  heatmapId: ''
};

export function SiteProvider({ children }: { children: ReactNode }) {
  // Use deep copy for initial state to avoid reference issues
  const [images, setImages] = useState<Record<ImageSection, Record<string, string>>>(
    JSON.parse(JSON.stringify(DEFAULT_IMAGES_MAP))
  );
  const [analytics, setAnalytics] = useState<GlobalSEOSettings>({ googleAnalyticsId: '', heatmapId: '' });
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    loadSiteData();
  }, []);

  // Inject scripts when analytics change
  useEffect(() => {
    if (analytics.googleAnalyticsId) {
      // We can't easily inject script tags in this environment safely without causing hydration issues or CSP errors sometimes.
      // But for a React app, we can append to head.
      const gaScript = document.createElement('script');
      gaScript.async = true;
      gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${analytics.googleAnalyticsId}`;
      document.head.appendChild(gaScript);

      const gaConfig = document.createElement('script');
      gaConfig.innerHTML = `
         window.dataLayer = window.dataLayer || [];
         function gtag(){dataLayer.push(arguments);}
         gtag('js', new Date());
         gtag('config', '${analytics.googleAnalyticsId}');
       `;
      document.head.appendChild(gaConfig);
    }

    // Heatmap injection logic (Microsoft Clarity)
    if (analytics.heatmapId && !document.getElementById('ms-clarity-init')) {
      const clarityScript = document.createElement('script');
      clarityScript.id = 'ms-clarity-init';
      clarityScript.type = "text/javascript";
      clarityScript.innerHTML = `
          (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "${analytics.heatmapId}");
      `;
      document.head.appendChild(clarityScript);
    }
  }, [analytics]);

  const loadSiteData = async () => {
    try {
      // Load site images from KV store (global_settings table)
      const { get } = await import('../utils/kvStore');
      const data = await get<Record<ImageSection, { id: string; value: string; alt?: string }[]>>('site_images');

      if (data) {
        // Merge loaded data with defaults
        const mergedImages: Record<ImageSection, Record<string, string>> = JSON.parse(JSON.stringify(DEFAULT_IMAGES_MAP));

        Object.entries(data).forEach(([section, blocks]) => {
          const sectionKey = section as ImageSection;
          if (mergedImages[sectionKey]) {
            blocks.forEach(block => {
              if (block.value) {
                mergedImages[sectionKey][block.id] = block.value;
              }
            });
          }
        });

        setImages(mergedImages);
      } else {
        setImages(DEFAULT_IMAGES_MAP);
      }

      // Load analytics settings
      const analyticsData = await get<GlobalSEOSettings>('global_seo');
      if (analyticsData) {
        setAnalytics(analyticsData);
      } else {
        setAnalytics(DEFAULT_SEO);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading site data:', error);
      // Use defaults on error
      setImages(DEFAULT_IMAGES_MAP);
      setAnalytics(DEFAULT_SEO);
      setLoading(false);
    }
  };

  return (
    <SiteContext.Provider value={{ images, analytics, loading, refreshImages: loadSiteData }}>
      {children}
    </SiteContext.Provider>
  );
}

export function useSiteSettings() {
  const context = useContext(SiteContext);
  if (context === undefined) {
    throw new Error('useSiteSettings must be used within a SiteProvider');
  }
  return context;
}