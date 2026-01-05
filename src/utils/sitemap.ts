/**
 * Sitemap Generator
 * Generates XML sitemap for all published pages, properties, and blog posts
 */

import { getPublishedProperties, getPublishedBlogPosts, getAllStaticPages } from './database';

const BASE_URL = 'https://bartlettandpartners.com';

interface SitemapEntry {
    loc: string;
    lastmod?: string;
    changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    priority?: number;
}

/**
 * Static pages with their priorities
 */
const STATIC_PAGES: SitemapEntry[] = [
    { loc: '/', changefreq: 'daily', priority: 1.0 },
    { loc: '/properties', changefreq: 'daily', priority: 0.9 },
    { loc: '/about', changefreq: 'monthly', priority: 0.7 },
    { loc: '/contact', changefreq: 'monthly', priority: 0.8 },
    { loc: '/insights', changefreq: 'weekly', priority: 0.7 },

];

/**
 * Area guide pages
 */
const AREA_GUIDES: SitemapEntry[] = [
    { loc: '/area-guides/richmond', changefreq: 'monthly', priority: 0.7 },
    { loc: '/area-guides/twickenham', changefreq: 'monthly', priority: 0.7 },
    { loc: '/area-guides/teddington', changefreq: 'monthly', priority: 0.7 },
    { loc: '/area-guides/kew', changefreq: 'monthly', priority: 0.7 },
    { loc: '/area-guides/ham', changefreq: 'monthly', priority: 0.7 },
];

/**
 * Format date as YYYY-MM-DD
 */
function formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toISOString().split('T')[0];
}

/**
 * Escape XML special characters
 */
function escapeXml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

/**
 * Generate a single URL entry for the sitemap
 */
function generateUrlEntry(entry: SitemapEntry): string {
    const lines = [
        '  <url>',
        `    <loc>${escapeXml(BASE_URL + entry.loc)}</loc>`,
    ];

    if (entry.lastmod) {
        lines.push(`    <lastmod>${entry.lastmod}</lastmod>`);
    }

    if (entry.changefreq) {
        lines.push(`    <changefreq>${entry.changefreq}</changefreq>`);
    }

    if (entry.priority !== undefined) {
        lines.push(`    <priority>${entry.priority.toFixed(1)}</priority>`);
    }

    lines.push('  </url>');
    return lines.join('\n');
}

/**
 * Generate the complete XML sitemap
 */
export async function generateSitemap(): Promise<string> {
    const entries: SitemapEntry[] = [];
    const today = formatDate(new Date());

    // Add static pages
    STATIC_PAGES.forEach(page => {
        entries.push({ ...page, lastmod: today });
    });

    // Add area guides
    AREA_GUIDES.forEach(page => {
        entries.push({ ...page, lastmod: today });
    });

    try {
        // Add published properties
        const properties = await getPublishedProperties();
        properties.forEach(property => {
            if (property.slug) {
                entries.push({
                    loc: `/properties/${property.slug}`,
                    lastmod: today, // UIProperty doesn't have updated_at
                    changefreq: 'weekly',
                    priority: 0.8
                });
            }
        });
    } catch (e) {
        console.warn('Could not fetch properties for sitemap:', e);
    }

    try {
        // Add published blog posts
        const blogPosts = await getPublishedBlogPosts();
        blogPosts.forEach(post => {
            if (post.slug) {
                entries.push({
                    loc: `/blog/${post.slug}`,
                    lastmod: post.updated_at ? formatDate(post.updated_at) : today,
                    changefreq: 'monthly',
                    priority: 0.6
                });
            }
        });
    } catch (e) {
        console.warn('Could not fetch blog posts for sitemap:', e);
    }

    // Build XML
    const xml = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        ...entries.map(generateUrlEntry),
        '</urlset>'
    ].join('\n');

    return xml;
}

/**
 * Get sitemap entries for display in CMS
 */
export async function getSitemapEntries(): Promise<SitemapEntry[]> {
    const entries: SitemapEntry[] = [...STATIC_PAGES, ...AREA_GUIDES];

    try {
        const properties = await getPublishedProperties();
        properties.forEach(property => {
            if (property.slug) {
                entries.push({
                    loc: `/properties/${property.slug}`,
                    changefreq: 'weekly',
                    priority: 0.8
                });
            }
        });

        const blogPosts = await getPublishedBlogPosts();
        blogPosts.forEach(post => {
            if (post.slug) {
                entries.push({
                    loc: `/blog/${post.slug}`,
                    changefreq: 'monthly',
                    priority: 0.6
                });
            }
        });
    } catch (e) {
        console.warn('Could not fetch dynamic content for sitemap:', e);
    }

    return entries;
}

/**
 * Check if a page is included in sitemap
 */
export function isInSitemap(path: string): boolean {
    const allPaths = [...STATIC_PAGES, ...AREA_GUIDES].map(e => e.loc);
    return allPaths.includes(path) || path.startsWith('/properties/') || path.startsWith('/blog/');
}
