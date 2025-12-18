/**
 * Auto-SEO Utility
 * Automatically generates SEO metadata from content when not manually set
 */

import { Property, BlogPost } from '../types/database';

interface AutoSEOResult {
    title: string;
    description: string;
    keywords: string[];
    ogImage?: string;
}

/**
 * Default site settings for SEO
 */
const SITE_NAME = 'Bartlett & Partners';
const TITLE_SUFFIX = ` | ${SITE_NAME}`;
const MAX_TITLE_LENGTH = 60;
const MAX_DESCRIPTION_LENGTH = 160;

/**
 * Truncate text to a maximum length, ending at a word boundary
 */
function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;

    const truncated = text.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');

    if (lastSpace > maxLength * 0.7) {
        return truncated.substring(0, lastSpace) + '...';
    }
    return truncated + '...';
}

/**
 * Strip HTML tags from text
 */
function stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

/**
 * Format price for display
 */
function formatPrice(price: number | string): string {
    const numPrice = typeof price === 'string' ? parseFloat(price.replace(/[^0-9.]/g, '')) : price;
    if (isNaN(numPrice)) return '';

    if (numPrice >= 1000000) {
        return `£${(numPrice / 1000000).toFixed(1)}m`;
    }
    return `£${(numPrice / 1000).toFixed(0)}k`;
}

/**
 * Generate SEO metadata for a Property
 */
export function generatePropertySEO(property: Property): AutoSEOResult {
    const price = formatPrice(property.price);
    const beds = property.beds ? `${property.beds} bed` : '';
    const type = property.property_type || 'property';
    const location = property.location || '';

    // Build title: "3 bed house for sale in Richmond, £1.2m | Bartlett & Partners"
    let title = '';
    if (beds) title += beds + ' ';
    title += type;
    if (property.status === 'Available') title += ' for sale';
    if (location) title += ` in ${location}`;
    if (price) title += `, ${price}`;

    // Ensure title fits with suffix
    const maxTitleContent = MAX_TITLE_LENGTH - TITLE_SUFFIX.length;
    title = truncateText(title, maxTitleContent) + TITLE_SUFFIX;

    // Build description from property description or features
    let description = '';
    if (property.description) {
        description = stripHtml(property.description);
    } else {
        // Build from features
        const features: string[] = [];
        if (beds) features.push(beds);
        if (property.baths) features.push(`${property.baths} bath`);
        if (property.sqft) features.push(`${property.sqft.toLocaleString()} sq ft`);
        description = `${type.charAt(0).toUpperCase() + type.slice(1)} in ${location}. ${features.join(', ')}. Contact Bartlett & Partners for viewings.`;
    }
    description = truncateText(description, MAX_DESCRIPTION_LENGTH);

    // Generate keywords from property attributes
    const keywords: string[] = [];
    if (location) keywords.push(location.toLowerCase());
    if (type) keywords.push(type.toLowerCase());
    if (beds) keywords.push(`${property.beds} bedroom`);
    keywords.push('property for sale');
    keywords.push('estate agents');
    if (location) keywords.push(`${location.toLowerCase()} property`);

    return {
        title,
        description,
        keywords,
        ogImage: property.hero_image || undefined
    };
}

/**
 * Generate SEO metadata for a Blog Post
 */
export function generateBlogSEO(post: BlogPost): AutoSEOResult {
    // Title: Use meta_title if set, otherwise post title
    let title = post.meta_title || post.title;
    const maxTitleContent = MAX_TITLE_LENGTH - TITLE_SUFFIX.length;
    title = truncateText(title, maxTitleContent) + TITLE_SUFFIX;

    // Description: Use meta_description if set, otherwise extract from content
    let description = post.meta_description || '';
    if (!description && post.content) {
        description = stripHtml(post.content);
    }
    description = truncateText(description, MAX_DESCRIPTION_LENGTH);

    // Keywords from meta or generate from category/title
    let keywords: string[] = [];
    if (post.keywords && post.keywords.length > 0) {
        keywords = post.keywords;
    } else {
        // Generate from title words
        const titleWords = post.title.toLowerCase().split(' ')
            .filter(word => word.length > 4)
            .slice(0, 5);
        keywords = [...titleWords, 'property insights', 'real estate', 'richmond'];
    }

    return {
        title,
        description,
        keywords,
        ogImage: post.featured_image || undefined
    };
}

/**
 * Generate SEO metadata for an Area Guide
 */
export function generateAreaGuideSEO(areaName: string, description?: string): AutoSEOResult {
    const title = `${areaName} Property Guide | Living in ${areaName}${TITLE_SUFFIX}`;

    const desc = description
        ? truncateText(stripHtml(description), MAX_DESCRIPTION_LENGTH)
        : `Discover ${areaName}. Local schools, transport links, property prices and lifestyle guide from Bartlett & Partners estate agents.`;

    const keywords = [
        areaName.toLowerCase(),
        `${areaName.toLowerCase()} property`,
        `living in ${areaName.toLowerCase()}`,
        `${areaName.toLowerCase()} estate agents`,
        'area guide',
        'property market'
    ];

    return {
        title: truncateText(title, MAX_TITLE_LENGTH),
        description: desc,
        keywords
    };
}

/**
 * Generate canonical URL for a page
 */
export function generateCanonicalURL(path: string): string {
    // Use actual host origin, fallback for SSR
    const baseURL = typeof window !== 'undefined' ? window.location.origin : 'https://bartlettandpartners.com';
    // Normalize path: ensure starts with /, remove trailing slash (except for root)
    let normalizedPath = path.startsWith('/') ? path : '/' + path;
    if (normalizedPath.length > 1 && normalizedPath.endsWith('/')) {
        normalizedPath = normalizedPath.slice(0, -1);
    }
    return baseURL + normalizedPath;
}

/**
 * Check if a meta field needs auto-generation
 * Returns true if the field is empty or uses a default placeholder
 */
export function needsAutoSEO(value: string | null | undefined): boolean {
    if (!value) return true;
    if (value.trim().length === 0) return true;
    if (value.toLowerCase().includes('placeholder')) return true;
    if (value.toLowerCase().includes('add meta')) return true;
    return false;
}

/**
 * Merge auto-generated SEO with manual overrides
 * Manual values take precedence when they exist
 */
export function mergeSEO(
    autoGenerated: AutoSEOResult,
    manual: Partial<AutoSEOResult>
): AutoSEOResult {
    return {
        title: needsAutoSEO(manual.title) ? autoGenerated.title : manual.title!,
        description: needsAutoSEO(manual.description) ? autoGenerated.description : manual.description!,
        keywords: manual.keywords && manual.keywords.length > 0 ? manual.keywords : autoGenerated.keywords,
        ogImage: manual.ogImage || autoGenerated.ogImage
    };
}
