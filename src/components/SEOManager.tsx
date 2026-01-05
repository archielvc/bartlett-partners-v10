import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { getPropertyBySlug, getBlogPostBySlug, getStaticPageBySlug } from '../utils/database';
import { get } from '../utils/kvStore';
import { useSEO } from '../contexts/SEOContext';
import { generateCanonicalURL } from '../utils/autoSEO';

interface SEOManagerProps {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  type?: 'website' | 'article';
  noindex?: boolean;
  canonical?: string;
}

interface GlobalSEOSettings {
  siteName: string;
  titleTemplate: string;
  defaultDescription: string;
  defaultKeywords: string[];
  googleAnalyticsId: string;
  heatmapId: string;
  facebookAppId?: string;
  twitterHandle?: string;

  organizationLogo?: string;
  site_favicon?: string;
}

interface SEOSetting {
  page_route: string;
  title: string;
  description: string;
  keywords: string[];
  url_slug?: string;
  og_image?: string;
}

const SEO_KEY = 'seo_settings';
const SEO_GLOBAL_KEY = 'seo_global';

/**
 * SEOManager Component
 * Dynamically updates page meta tags based on:
 * 1. Context data from individual pages (for dynamic content like properties/blog posts)
 * 2. SEO Settings from CMS (for static pages)
 * 3. Global defaults
 */
export function SEOManager({
  title: propTitle,
  description: propDescription,
  keywords: propKeywords,
  ogImage: propOgImage,
  type: propType = 'website',
  noindex: propNoindex = false,
  canonical: propCanonical
}: SEOManagerProps = {}) {
  const location = useLocation();
  const { seoData } = useSEO();

  useEffect(() => {
    const updateSEO = async () => {
      try {
        // Load global settings, page-specific settings, AND static page data
        const currentPath = location.pathname;
        const [globalSettings, pageSettings, staticPage] = await Promise.all([
          get<GlobalSEOSettings>(SEO_GLOBAL_KEY),
          get<SEOSetting[]>(SEO_KEY), // Also switch to kvStore here for consistency
          getStaticPageBySlug(currentPath)
        ]);

        // Find settings for current route (legacy system)
        const routeSettings = pageSettings?.find(s => s.page_route === currentPath);

        // Priority: Context SEO data > Props > Static Pages > Route settings > Global defaults
        const title = seoData.title || propTitle;
        const description = seoData.description || propDescription;
        const keywords = seoData.keywords || propKeywords;
        const ogImage = seoData.ogImage || propOgImage;
        const type = seoData.type || propType;

        // Determine final values with static page data in the priority chain
        const finalTitle = title
          || staticPage?.meta_title
          || routeSettings?.title
          || globalSettings?.siteName
          || 'Bartlett & Partners';

        const finalDescription = description
          || staticPage?.meta_description
          || routeSettings?.description
          || globalSettings?.defaultDescription
          || 'Luxury property sales and lettings in Richmond, Surrey, and London.';

        // Handle keywords - static_pages stores as string, need to convert
        let finalKeywords: string[];
        if (keywords) {
          finalKeywords = keywords;
        } else if (staticPage?.keywords) {
          // Split comma-separated string into array
          finalKeywords = staticPage.keywords.split(',').map(k => k.trim()).filter(k => k);
        } else if (routeSettings?.keywords) {
          finalKeywords = routeSettings.keywords;
        } else if (globalSettings?.defaultKeywords) {
          finalKeywords = globalSettings.defaultKeywords;
        } else {
          finalKeywords = ['luxury', 'real estate', 'richmond'];
        }

        const finalOgImage = ogImage
          || staticPage?.og_image
          || routeSettings?.og_image
          || globalSettings?.organizationLogo
          || '';

        // Apply title template if available
        let displayTitle = finalTitle;
        if (globalSettings?.titleTemplate && title) {
          displayTitle = globalSettings.titleTemplate.replace('%s', finalTitle);
        } else if (!title && finalTitle) {
          displayTitle = finalTitle;
        }

        // Update document title
        document.title = displayTitle;

        // Update or create meta tags
        updateMetaTag('name', 'description', finalDescription);
        updateMetaTag('name', 'keywords', finalKeywords.join(', '));

        // Handle noindex
        if (propNoindex) {
          updateMetaTag('name', 'robots', 'noindex, nofollow');
        } else {
          // Remove noindex if it was previously set
          const robotsMeta = document.querySelector('meta[name="robots"]');
          if (robotsMeta && robotsMeta.getAttribute('content')?.includes('noindex')) {
            robotsMeta.setAttribute('content', 'index, follow');
          }
        }

        // Set canonical URL
        const canonicalUrl = propCanonical || generateCanonicalURL(location.pathname);
        let linkCanonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
        if (!linkCanonical) {
          linkCanonical = document.createElement('link');
          linkCanonical.setAttribute('rel', 'canonical');
          document.head.appendChild(linkCanonical);
        }
        linkCanonical.href = canonicalUrl;

        // Open Graph tags
        updateMetaTag('property', 'og:title', displayTitle);
        updateMetaTag('property', 'og:description', finalDescription);
        updateMetaTag('property', 'og:type', type);
        updateMetaTag('property', 'og:url', canonicalUrl);
        if (finalOgImage) {
          updateMetaTag('property', 'og:image', finalOgImage);
        }
        if (globalSettings?.siteName) {
          updateMetaTag('property', 'og:site_name', globalSettings.siteName);
        }

        // Twitter Card tags
        updateMetaTag('name', 'twitter:card', 'summary_large_image');
        updateMetaTag('name', 'twitter:title', displayTitle);
        updateMetaTag('name', 'twitter:description', finalDescription);
        if (finalOgImage) {
          updateMetaTag('name', 'twitter:image', finalOgImage);
        }
        if (globalSettings?.twitterHandle) {
          updateMetaTag('name', 'twitter:site', `@${globalSettings.twitterHandle}`);
        }

        // Facebook App ID
        if (globalSettings?.facebookAppId) {
          updateMetaTag('property', 'fb:app_id', globalSettings.facebookAppId);
        }

        // Note: Analytics (GA4, Clarity) are now loaded via AnalyticsContext
        // which respects cookie consent. See src/contexts/AnalyticsContext.tsx

        // Favicon Handling
        if (globalSettings?.site_favicon) {
          updateLinkTag('icon', globalSettings.site_favicon);
          updateLinkTag('shortcut icon', globalSettings.site_favicon); // Add shortcut icon for better compatibility
          updateLinkTag('apple-touch-icon', globalSettings.site_favicon);
        }

      } catch (error) {
        console.error('Error updating SEO:', error);
      }
    };

    updateSEO();
  }, [propTitle, propDescription, propKeywords, propOgImage, propType, propNoindex, propCanonical, location.pathname, seoData]);

  return null; // This component doesn't render anything
}

/**
 * Helper function to update or create a meta tag
 */
function updateMetaTag(attribute: 'name' | 'property', attributeValue: string, content: string) {
  if (!content) return;

  let element = document.querySelector(`meta[${attribute}="${attributeValue}"]`);

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, attributeValue);
    document.head.appendChild(element);
  }

  element.setAttribute('content', content);
}



/**
 * Helper function to update or create a link tag (for favicons)
 */
function updateLinkTag(rel: string, href: string) {
  if (!href) return;

  // Find all existing links with this rel to avoid duplicates
  const existingElements = document.querySelectorAll(`link[rel="${rel}"]`);
  let element: HTMLLinkElement;

  if (existingElements.length > 0) {
    // Update the first one
    element = existingElements[0] as HTMLLinkElement;
    // Remove duplicates if any (cleanup)
    for (let i = 1; i < existingElements.length; i++) {
      existingElements[i].remove();
    }
  } else {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }

  // Only update if changed to prevent flickering/re-fetches
  if (element.href !== href && !href.endsWith(element.getAttribute('href') || '')) {
    element.href = href;

    // Update type based on extension
    if (href.endsWith('.svg')) {
      element.setAttribute('type', 'image/svg+xml');
    } else if (href.endsWith('.png')) {
      element.setAttribute('type', 'image/png');
    } else if (href.endsWith('.ico')) {
      element.setAttribute('type', 'image/x-icon');
    } else if (href.endsWith('.jpg') || href.endsWith('.jpeg')) {
      element.setAttribute('type', 'image/jpeg');
    } else {
      // Check for base64 or other formats
      if (href.startsWith('data:image/svg+xml')) {
        element.setAttribute('type', 'image/svg+xml');
      } else if (href.startsWith('data:image/png')) {
        element.setAttribute('type', 'image/png');
      } else {
        element.removeAttribute('type');
      }
    }
  }
}