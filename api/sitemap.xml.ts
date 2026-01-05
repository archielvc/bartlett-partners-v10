import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Supabase credentials - use env vars in production, fallback for local dev
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://bylofefjrwvytskcivit.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const BASE_URL = 'https://bartlettandpartners.com';

interface BlogPost {
  slug: string;
  updated_at: string | null;
}

interface Property {
  slug: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const staticPages = [
      { loc: '/', priority: 1.0, changefreq: 'daily' },
      { loc: '/properties', priority: 0.9, changefreq: 'daily' },
      { loc: '/insights', priority: 0.7, changefreq: 'weekly' },
      { loc: '/about', priority: 0.7, changefreq: 'monthly' },
      { loc: '/contact', priority: 0.8, changefreq: 'monthly' },
      // Area guides
      { loc: '/area-guides/richmond', priority: 0.7, changefreq: 'monthly' },
      { loc: '/area-guides/twickenham', priority: 0.7, changefreq: 'monthly' },
      { loc: '/area-guides/teddington', priority: 0.7, changefreq: 'monthly' },
      { loc: '/area-guides/kew', priority: 0.7, changefreq: 'monthly' },
      { loc: '/area-guides/ham', priority: 0.7, changefreq: 'monthly' },
    ];

    // Fetch blog posts
    const { data: posts, error: postsError } = await supabase
      .from('blog_posts')
      .select('slug, updated_at')
      .eq('status', 'published');

    if (postsError) {
      console.warn('Error fetching blog posts:', postsError);
    }

    // Fetch properties
    const { data: properties, error: propsError } = await supabase
      .from('properties')
      .select('slug')
      .eq('status', 'published');

    if (propsError) {
      console.warn('Error fetching properties:', propsError);
    }

    const today = new Date().toISOString().split('T')[0];

    // Build XML
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Static pages
    staticPages.forEach(page => {
      xml += '  <url>\n';
      xml += `    <loc>${escapeXml(BASE_URL + page.loc)}</loc>\n`;
      xml += `    <lastmod>${today}</lastmod>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority.toFixed(1)}</priority>\n`;
      xml += '  </url>\n';
    });

    // Blog posts - using /blog/ path
    (posts as BlogPost[] || []).forEach(post => {
      if (post.slug) {
        const lastmod = post.updated_at ? post.updated_at.split('T')[0] : today;
        xml += '  <url>\n';
        xml += `    <loc>${escapeXml(BASE_URL + '/blog/' + post.slug)}</loc>\n`;
        xml += `    <lastmod>${lastmod}</lastmod>\n`;
        xml += '    <changefreq>monthly</changefreq>\n';
        xml += '    <priority>0.6</priority>\n';
        xml += '  </url>\n';
      }
    });

    // Properties
    (properties as Property[] || []).forEach(prop => {
      if (prop.slug) {
        xml += '  <url>\n';
        xml += `    <loc>${escapeXml(BASE_URL + '/properties/' + prop.slug)}</loc>\n`;
        xml += `    <lastmod>${today}</lastmod>\n`;
        xml += '    <changefreq>weekly</changefreq>\n';
        xml += '    <priority>0.8</priority>\n';
        xml += '  </url>\n';
      }
    });

    xml += '</urlset>';

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    res.status(200).send(xml);
  } catch (error) {
    console.error('Sitemap generation error:', error);
    res.status(500).send('Error generating sitemap');
  }
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
