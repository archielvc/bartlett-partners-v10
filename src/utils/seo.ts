/**
 * SEO utility functions and metadata for consistent SEO across all pages
 */

export interface PageSEO {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  canonical?: string;
  type?: 'website' | 'article' | 'product';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
}

// SEO metadata for each page (Static defaults)
export const PAGE_SEO: Record<string, PageSEO> = {
  home: {
    title: 'Estate Agents Richmond, Twickenham & Teddington | Bartlett & Partners',
    description: 'Independent estate agents in Richmond, Twickenham and Teddington. Director-led service with 30+ years experience. Book your free valuation today.',
    keywords: ['estate agents Richmond', 'estate agents Twickenham', 'estate agents Teddington', 'property for sale', 'luxury real estate'],
    type: 'website'
  },
  properties: {
    title: 'Property for Sale Richmond, Twickenham & Teddington | Bartlett & Partners',
    description: 'Browse homes for sale in Richmond, Twickenham, Teddington, Kew and Ham. Family houses, period properties and riverside homes. View our current listings.',
    keywords: ['property for sale', 'houses for sale Twickenham', 'homes for sale Richmond', 'Teddington property', 'luxury properties'],
    type: 'website'
  },
  about: {
    title: 'About Us | Estate Agents Richmond | Bartlett & Partners',
    description: 'Meet Darren Bartlett and the team. 30+ years selling homes in Richmond, Twickenham and Teddington. Director-led service, honest advice, exceptional results.',
    keywords: ['about estate agents', 'Richmond estate agents', 'boutique agency', 'director-led service'],
    type: 'website'
  },
  insights: {
    title: 'Property Insights & News | Bartlett & Partners',
    description: 'Expert insights, market trends and property news from our team of real estate professionals.',
    keywords: ['property insights', 'real estate news', 'market trends', 'property blog'],
    type: 'website'
  },
  contact: {
    title: 'Contact Us | Estate Agents Teddington | Bartlett & Partners',
    description: 'Get in touch with Bartlett & Partners. Based in Teddington, serving Richmond, Twickenham and surrounding areas. Call 020 8614 1441 or book a free valuation.',
    keywords: ['contact estate agent', 'Teddington', 'Richmond', 'property enquiry'],
    type: 'website'
  },
};

/**
 * Helper to clear existing SEO tags to prevent duplicates
 * (Though updateMetaTag handles updates, this is for cleanup if needed)
 */
function clearMetaTags() {
  // In a SPA, we usually just update.
}

/**
 * Apply SEO metadata to the document (Static)
 */
export function applySEO(pageName: string): void {
  const seo = PAGE_SEO[pageName] || PAGE_SEO.home;
  updateSEO(seo);
}

/**
 * Update SEO metadata dynamically
 */
export function updateSEO(seo: PageSEO): void {
  // Update document title
  document.title = seo.title;

  // Update meta description
  setMetaTag('name', 'description', seo.description);

  // Update meta keywords
  if (seo.keywords && seo.keywords.length > 0) {
    setMetaTag('name', 'keywords', seo.keywords.join(', '));
  }

  // Update Open Graph tags
  setMetaTag('property', 'og:title', seo.title);
  setMetaTag('property', 'og:description', seo.description);
  setMetaTag('property', 'og:type', seo.type || 'website');
  if (seo.ogImage) {
    setMetaTag('property', 'og:image', seo.ogImage);
  }
  if (seo.canonical) {
    setMetaTag('property', 'og:url', seo.canonical);
  }

  // Update Twitter Card tags
  setMetaTag('name', 'twitter:card', 'summary_large_image');
  setMetaTag('name', 'twitter:title', seo.title);
  setMetaTag('name', 'twitter:description', seo.description);
  if (seo.ogImage) {
    setMetaTag('name', 'twitter:image', seo.ogImage);
  }

  // Update canonical URL
  if (seo.canonical) {
    let linkCanonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.href = seo.canonical;
  }

  // Article specific tags
  if (seo.type === 'article') {
    if (seo.publishedTime) setMetaTag('property', 'article:published_time', seo.publishedTime);
    if (seo.modifiedTime) setMetaTag('property', 'article:modified_time', seo.modifiedTime);
    if (seo.author) setMetaTag('property', 'article:author', seo.author);
  }
}

/**
 * Helper function to update or create a meta tag
 * Handles both 'name' (standard) and 'property' (OG) attributes
 */
function setMetaTag(attrName: 'name' | 'property', attrValue: string, content: string): void {
  let meta = document.querySelector(`meta[${attrName}="${attrValue}"]`);
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attrName, attrValue);
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', content);
}

/**
 * Inject JSON-LD Structured Data
 */
export function injectSchema(schema: Record<string, any>): void {
  let script = document.getElementById('schema-json-ld');
  if (!script) {
    script = document.createElement('script');
    script.id = 'schema-json-ld';
    script.setAttribute('type', 'application/ld+json');
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(schema);
}

/**
 * Schema Generators
 */
export const SchemaGenerator = {
  organization: () => ({
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "name": "Bartlett & Partners",
    "image": "https://bartlettandpartners.com/logo.png", // Placeholder
    "description": "Luxury Real Estate Specialists in London",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "102-104 Church Road",
      "addressLocality": "Teddington",
      "postalCode": "TW11 8PY",
      "addressCountry": "UK"
    },
    "priceRange": "££££",
    "url": "https://bartlettandpartners.com"
  }),

  article: (article: { headline: string; image?: string; datePublished: string; dateModified?: string; author?: string; description?: string }) => ({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": article.headline,
    "image": article.image ? [article.image] : [],
    "datePublished": article.datePublished,
    "dateModified": article.dateModified || article.datePublished,
    "author": [{
      "@type": "Person",
      "name": article.author || "Bartlett & Partners"
    }],
    "publisher": {
      "@type": "Organization",
      "name": "Bartlett & Partners",
      "logo": {
        "@type": "ImageObject",
        "url": "https://bartlettandpartners.com/logo.png"
      }
    },
    "description": article.description
  }),

  product: (property: { title: string; description: string; image: string; price: string; address: string; beds: number }) => ({
    "@context": "https://schema.org",
    "@type": "Product", // Or RealEstateListing (more specific but Product is widely supported)
    "name": property.title,
    "image": [property.image],
    "description": property.description,
    "brand": {
      "@type": "Brand",
      "name": "Bartlett & Partners"
    },
    "offers": {
      "@type": "Offer",
      "url": window.location.href,
      "priceCurrency": "GBP",
      "price": property.price.replace(/[^0-9.]/g, ''), // Strip non-numeric
      "itemCondition": "https://schema.org/NewCondition",
      "availability": "https://schema.org/InStock" // Available
    }
  }),

  // Better Real Estate specific schema
  realEstateListing: (property: { title: string; description: string; image: string; price: string; address: string; beds: number }) => ({
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "name": property.title,
    "image": [property.image],
    "description": property.description,
    "datePosted": new Date().toISOString(), // Approximation
    "offers": {
      "@type": "Offer",
      "priceCurrency": "GBP",
      "price": property.price.replace(/[^0-9.]/g, ''),
      "availability": "https://schema.org/InStock"
    }
  })
};