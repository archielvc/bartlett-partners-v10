/**
 * SEO Scoring Utility
 * Calculates SEO health scores (0-100) based on various factors
 */

interface SEOData {
  meta_title?: string;
  meta_description?: string;
  slug?: string;
  keywords?: string;
  og_image?: string;
  content?: string;
  index_enabled?: boolean;
  sitemap_enabled?: boolean;
}

export function calculateSEOScore(data: SEOData): number {
  let score = 0;

  // ===== META ELEMENTS (40 points) =====
  
  // Meta Title (20 points total)
  if (data.meta_title) {
    score += 10; // Has meta title
    const titleLength = data.meta_title.length;
    if (titleLength >= 50 && titleLength <= 70) {
      score += 10; // Optimal length
    } else if (titleLength >= 40 && titleLength <= 80) {
      score += 5; // Acceptable length
    }
  }

  // Meta Description (20 points total)
  if (data.meta_description) {
    score += 10; // Has meta description
    const descLength = data.meta_description.length;
    if (descLength >= 150 && descLength <= 180) {
      score += 10; // Optimal length
    } else if (descLength >= 120 && descLength <= 200) {
      score += 5; // Acceptable length
    }
  }

  // ===== CONTENT QUALITY (30 points) =====
  
  // Focus Keywords (10 points)
  if (data.keywords && data.keywords.trim().length > 0) {
    const keywordCount = data.keywords.split(',').filter(k => k.trim().length > 0).length;
    if (keywordCount >= 3) {
      score += 10; // 3+ keywords
    } else if (keywordCount >= 1) {
      score += 5; // 1-2 keywords
    }
  }

  // Content Length (10 points)
  if (data.content) {
    const contentLength = data.content.length;
    if (contentLength >= 300) {
      score += 10; // Substantial content
    } else if (contentLength >= 100) {
      score += 5; // Some content
    }
  } else {
    // If no content field, assume it's a page with content (give benefit of doubt)
    score += 7;
  }

  // Heading Structure (10 points)
  // For now, give partial credit if meta title exists (proxy for structure)
  if (data.meta_title) {
    score += 8; // Assume good structure if title is set
  }

  // ===== TECHNICAL SEO (20 points) =====
  
  // Clean URL Slug (10 points)
  if (data.slug) {
    const isCleanSlug = /^\/[a-z0-9\-\/]*$/.test(data.slug);
    if (isCleanSlug) {
      score += 10; // Clean, SEO-friendly URL
    } else {
      score += 5; // URL exists but could be cleaner
    }
  }

  // OG Image (10 points)
  if (data.og_image && data.og_image.length > 0) {
    score += 10; // Has social sharing image
  }

  // ===== INDEXING (10 points) =====
  
  // Indexing Enabled (5 points)
  if (data.index_enabled !== false) {
    score += 5; // Default to true if not specified
  }

  // Sitemap Included (5 points)
  if (data.sitemap_enabled !== false) {
    score += 5; // Default to true if not specified
  }

  return Math.min(100, score); // Cap at 100
}

/**
 * Get color class for SEO score
 */
export function getSEOScoreColor(score: number): string {
  if (score >= 90) return 'bg-emerald-500';
  if (score >= 70) return 'bg-yellow-500';
  return 'bg-red-500';
}

/**
 * Get status label for SEO score
 */
export function getSEOScoreLabel(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Needs Work';
  return 'Poor';
}

/**
 * Get recommendations based on SEO score
 */
export function getSEORecommendations(data: SEOData): string[] {
  const recommendations: string[] = [];

  // Meta Title
  if (!data.meta_title) {
    recommendations.push('Add a meta title (50-60 characters)');
  } else if (data.meta_title.length < 40) {
    recommendations.push('Meta title is too short (aim for 50-60 characters)');
  } else if (data.meta_title.length > 70) {
    recommendations.push('Meta title is too long (it may be cut off in search results)');
  }

  // Meta Description
  if (!data.meta_description) {
    recommendations.push('Add a meta description (150-160 characters)');
  } else if (data.meta_description.length < 120) {
    recommendations.push('Meta description is too short (aim for 150-160 characters)');
  } else if (data.meta_description.length > 180) {
    recommendations.push('Meta description is too long (it may be cut off)');
  }

  // Keywords
  if (!data.keywords || data.keywords.trim().length === 0) {
    recommendations.push('Add focus keywords for better targeting');
  }

  // OG Image
  if (!data.og_image) {
    recommendations.push('Add an Open Graph image for social media sharing');
  }

  // URL Slug
  if (data.slug && !/^\/[a-z0-9\-\/]*$/.test(data.slug)) {
    recommendations.push('Optimize URL slug (use lowercase letters, numbers, and hyphens only)');
  }

  return recommendations;
}
