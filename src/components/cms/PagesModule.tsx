import React, { useState, useEffect } from 'react';
import { Search, Filter, Edit, Eye, MoreHorizontal, ArrowLeft, ArrowUpRight, Settings, ChevronDown, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../utils/supabase/client';
import { getAllStaticPages, updateStaticPage } from '../../utils/database';
import { getAllPropertiesAdmin, updateProperty, getAllBlogPostsAdmin, updateBlogPost } from '../../utils/database';
import { StaticPage, Property, BlogPost } from '../../types/database';
import { calculateSEOScore, getSEOScoreColor, getSEOScoreLabel, getSEORecommendations } from '../../utils/seoScoring';
import { CharacterCounter } from './CharacterCounter';
import GlobalSEOSettings from './GlobalSEOSettings';
import { Button } from '../ui/button';
import { CMSPageLayout } from './CMSPageLayout';
import { CMSImageUpload } from './CMSImageUpload';
import { getGlobalSettings, setGlobalSettings } from '../../utils/database';

const GLOBAL_HERO_IMAGES_KEY = 'page_hero_images';

interface PageDisplay {
  id: string;
  name: string;
  slug: string;
  seoScore: number;
  status: 'published' | 'draft';
  lastEdited: string;
  page_group?: string;
  type: 'static' | 'property' | 'blog';
  data?: StaticPage | Property | BlogPost;
}

export function PagesModule() {
  const [loading, setLoading] = useState(true);
  const [pages, setPages] = useState<PageDisplay[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['static', 'properties', 'blog', 'areas']));
  const [editingPage, setEditingPage] = useState<PageDisplay | null>(null);
  const [showGlobalSettings, setShowGlobalSettings] = useState(false);

  // SEO Form State
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [urlSlug, setUrlSlug] = useState('');
  const [keywords, setKeywords] = useState('');
  const [ogImage, setOgImage] = useState('');
  const [noindex, setNoindex] = useState(false);
  const [nofollow, setNofollow] = useState(false);
  const [sitemapEnabled, setSitemapEnabled] = useState(true);
  const [pageStatus, setPageStatus] = useState<'published' | 'draft'>('published');

  // Hero Image State
  const [heroImage, setHeroImage] = useState('');
  const [pageHeroImages, setPageHeroImages] = useState<Record<string, string>>({});

  const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';

  useEffect(() => {
    loadPages();
  }, []);

  // Populate form fields when editing page changes
  useEffect(() => {
    if (editingPage && editingPage.data) {
      if (editingPage.type === 'static') {
        const staticData = editingPage.data as StaticPage;
        setMetaTitle(staticData.meta_title || '');
        setMetaDescription(staticData.meta_description || '');
        setUrlSlug(staticData.slug);
        setKeywords(staticData.keywords || '');
        setOgImage(staticData.og_image || '');
        setNoindex(staticData.noindex);
        setNofollow(staticData.nofollow);
        setSitemapEnabled(staticData.sitemap_enabled);
        setPageStatus(staticData.status);

        // Set hero image if applicable
        if (['/properties', '/about', '/insights', '/insights/newsletter'].includes(staticData.slug)) {
          // Normalize slug to key (remove leading slash)
          const key = staticData.slug.replace(/^\//, '');
          setHeroImage(pageHeroImages[key] || '');
        } else {
          setHeroImage('');
        }
      } else if (editingPage.type === 'property') {
        const propertyData = editingPage.data as Property;
        setUrlSlug(propertyData.slug);
        setKeywords(propertyData.keywords?.join(', ') || '');
        setOgImage(propertyData.hero_image || '');
        // Properties are always indexable
        setNoindex(false);
        setNofollow(false);
        setSitemapEnabled(true);
        setPageStatus(propertyData.status === 'draft' ? 'draft' : 'published');
        setHeroImage(''); // Properties typically use hero_image field in DB, not global override
      } else if (editingPage.type === 'blog') {
        const blogData = editingPage.data as BlogPost;
        setMetaTitle(blogData.meta_title || '');
        setMetaDescription(blogData.meta_description || '');
        setUrlSlug(blogData.slug);
        setKeywords(blogData.keywords || '');
        setOgImage(blogData.featured_image || '');
        setNoindex(blogData.noindex || false);
        setNofollow(blogData.nofollow || false);
        setSitemapEnabled(blogData.sitemap_enabled !== undefined ? blogData.sitemap_enabled : true);
        setPageStatus(blogData.status === 'published' ? 'published' : 'draft');
        setHeroImage('');
      }
    }
  }, [editingPage, pageHeroImages]);

  async function loadPages() {
    try {
      setLoading(true);
      // Initialize static pages if needed (skipping redundant local definition for brevity, assuming DB has them or using empty [] to fail gracefully)
      // await initializeStaticPages(); // Removed local definition to simplify, assuming DB is populated or handled by other means

      const [staticPagesData, properties, blogPosts, globalImages] = await Promise.all([
        getAllStaticPages().catch(() => []),
        getAllPropertiesAdmin(),
        getAllBlogPostsAdmin(),
        getGlobalSettings<Record<string, string>>(GLOBAL_HERO_IMAGES_KEY).catch(() => ({}))
      ]);

      if (globalImages) {
        setPageHeroImages(globalImages);
      }

      const allPages: PageDisplay[] = [];

      // Add static pages
      staticPagesData.forEach(page => {
        const seoScore = calculateSEOScore({
          meta_title: page.meta_title || undefined,
          meta_description: page.meta_description || undefined,
          slug: page.slug,
          keywords: page.keywords || undefined,
          og_image: page.og_image || undefined,
          index_enabled: !page.noindex,
          sitemap_enabled: page.sitemap_enabled
        });
        allPages.push({
          id: `static-${page.id}`,
          name: page.name,
          slug: page.slug,
          seoScore: seoScore,
          status: page.status,
          lastEdited: new Date(page.updated_at).toLocaleString(),
          page_group: page.page_group || undefined,
          type: 'static',
          data: page
        });
      });

      // Add properties
      properties.forEach(property => {
        const seoScore = calculateSEOScore({
          meta_title: property.meta_title || undefined,
          meta_description: property.meta_description || undefined,
          slug: property.slug,
          content: property.description || undefined,
          og_image: property.hero_image || undefined,
          index_enabled: true,
          sitemap_enabled: true
        });
        allPages.push({
          id: `property-${property.id}`,
          name: property.title,
          slug: property.slug,
          seoScore: seoScore,
          status: property.status === 'draft' ? 'draft' : 'published',
          lastEdited: new Date(property.updated_at).toLocaleString(),
          page_group: 'properties',
          type: 'property',
          data: property
        });
      });

      // Add blog posts
      blogPosts.forEach(post => {
        const seoScore = calculateSEOScore({
          meta_title: post.meta_title || undefined,
          meta_description: post.meta_description || undefined,
          slug: post.slug,
          content: post.content,
          og_image: post.featured_image || undefined,
          index_enabled: !post.noindex,
          sitemap_enabled: post.sitemap_enabled !== undefined ? post.sitemap_enabled : true
        });
        allPages.push({
          id: `blog-${post.id}`,
          name: post.title,
          slug: post.slug,
          seoScore: seoScore,
          status: post.status === 'published' ? 'published' : 'draft',
          lastEdited: new Date(post.updated_at).toLocaleString(),
          page_group: 'blog',
          type: 'blog',
          data: post
        });
      });

      setPages(allPages);
    } catch (error) {
      console.error('Error loading pages:', error);
      toast.error('Failed to load pages');
    } finally {
      setLoading(false);
    }
  }

  const toggleGroup = (group: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(group)) {
      newExpanded.delete(group);
    } else {
      newExpanded.add(group);
    }
    setExpandedGroups(newExpanded);
  };

  const handleSaveSettings = async () => {
    if (!editingPage) return;

    try {
      setLoading(true);

      if (editingPage.type === 'static') {
        const staticData = editingPage.data as StaticPage;

        // Save global hero image if applicable
        if (['/properties', '/about', '/insights', '/insights/newsletter'].includes(editingPage.slug)) {
          const key = editingPage.slug.replace(/^\//, '');
          const newImages = { ...pageHeroImages, [key]: heroImage };
          await setGlobalSettings(GLOBAL_HERO_IMAGES_KEY, newImages);
          setPageHeroImages(newImages);
        }

        const success = await updateStaticPage(editingPage.slug, {
          name: editingPage.name,
          meta_title: metaTitle,
          meta_description: metaDescription,
          slug: urlSlug || editingPage.slug,
          keywords: keywords,
          og_image: ogImage || null,
          noindex: noindex,
          nofollow: nofollow,
          sitemap_enabled: sitemapEnabled,
          status: pageStatus as 'published' | 'draft',
          page_group: staticData?.page_group || null
        });
        if (success) {
          toast.success('SEO settings saved successfully');
          setEditingPage(null);
          await loadPages();
        } else toast.error('Failed to save settings');
      } else if (editingPage.type === 'property' && editingPage.data) {
        const propertyData = editingPage.data as Property;
        const success = await updateProperty(propertyData.id, {
          meta_title: metaTitle,
          meta_description: metaDescription,
          slug: urlSlug || editingPage.slug,
          keywords: keywords.split(',').map(k => k.trim()).filter(k => k)
        });
        if (success) {
          toast.success('SEO settings saved successfully');
          setEditingPage(null);
          await loadPages();
        } else toast.error('Failed to save settings');
      } else if (editingPage.type === 'blog' && editingPage.data) {
        const blogData = editingPage.data as BlogPost;
        const success = await updateBlogPost(blogData.id, {
          meta_title: metaTitle,
          meta_description: metaDescription,
          slug: urlSlug || editingPage.slug,
          keywords: keywords,
          noindex: noindex,
          nofollow: nofollow,
          sitemap_enabled: sitemapEnabled
        });
        if (success) {
          toast.success('SEO settings saved successfully');
          setEditingPage(null);
          await loadPages();
        } else toast.error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving SEO settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  // Groups
  const individualPages = pages.filter(p => !p.page_group);
  const propertyPages = pages.filter(p => p.page_group === 'properties');
  const blogPages = pages.filter(p => p.page_group === 'blog');
  const areaPages = pages.filter(p => p.page_group === 'areas');
  const otherPages = pages.filter(p => p.page_group === 'other');

  const renderTable = (items: PageDisplay[]) => (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left px-6 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Page Name</th>
            <th className="text-left px-6 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">URL Slug</th>
            <th className="text-left px-6 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">SEO Score</th>
            <th className="text-left px-6 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
            <th className="text-left px-6 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Last Edited</th>
            <th className="text-right px-6 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {items.map((page) => (
            <tr key={page.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4"><div className="font-medium text-gray-900">{page.name}</div></td>
              <td className="px-6 py-4"><div className="text-sm text-gray-600">{page.slug}</div></td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className={`h-2 rounded-full ${getSEOScoreColor(page.seoScore)}`} style={{ width: `${page.seoScore}%` }}></div>
                  </div>
                  <span className="text-sm text-gray-600">{page.seoScore}%</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${page.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                  {page.status}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">{page.lastEdited}</td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-end gap-2">
                  <button onClick={() => setEditingPage(page)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Edit SEO Settings">
                    <Edit className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Global Settings View
  if (showGlobalSettings) {
    return (
      <div className="p-8">
        <button onClick={() => setShowGlobalSettings(false)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Pages</span>
        </button>
        <GlobalSEOSettings />
      </div>
    );
  }

  // SEO Settings Edit View
  if (editingPage) {
    const isSpecialPage = editingPage.type === 'static' && ['/properties', '/about', '/insights', '/insights/newsletter'].includes(editingPage.slug);

    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <button onClick={() => setEditingPage(null)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Pages</span>
          </button>
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">SEO Settings: {editingPage.name}</h1>
          <p className="text-gray-600">Optimize this page for search engines</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <div className="space-y-6">
            {/* Hero Image Section for Special Pages */}
            {isSpecialPage && (
              <div className="pb-6 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-4">Page Appearance</h3>
                <CMSImageUpload
                  label="Hero Image"
                  value={heroImage}
                  onChange={setHeroImage}
                  description="Main banner image displayed at the top of the page. Recommended size: 2000x1200px"
                  bucket="site-assets"
                  folder="headers"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Meta Title</label>
              <div className="relative">
                <input type="text" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} className="w-full px-4 py-2.5 pr-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2551] focus:border-transparent" placeholder="Page title" />
                <CharacterCounter current={metaTitle.length} optimal={60} max={70} className="absolute right-3 top-3" />
              </div>
              <p className="text-xs text-gray-500 mt-1.5">Recommended 50-60 characters</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
              <div className="relative">
                <textarea rows={3} value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} className="w-full px-4 py-2.5 pr-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2551] focus:border-transparent resize-none" placeholder="Description" />
                <CharacterCounter current={metaDescription.length} optimal={160} max={180} className="absolute right-3 bottom-3" />
              </div>
              <p className="text-xs text-gray-500 mt-1.5">Recommended 150-160 characters</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">URL Slug</label>
              <input type="text" value={urlSlug} onChange={(e) => setUrlSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2551] focus:border-transparent font-mono text-sm" placeholder="page-url-slug" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Canonical URL</label>
              <input type="text" value={`${siteUrl}/${(urlSlug || editingPage.slug || '').replace(/^\//, '')}`} readOnly className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-700" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Focus Keywords</label>
              <input type="text" value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="comma, separated, keywords" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2551] focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Social Share Image (OG Image)</label>
              <button className="w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#1A2551] transition-colors text-gray-600 hover:text-[#1A2551] font-medium">Upload OG Image</button>
            </div>
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Search Engine Settings</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="index" checked={!noindex} onChange={(e) => setNoindex(!e.target.checked)} className="w-4 h-4 text-[#1A2551] rounded border-gray-300 focus:ring-[#1A2551]" />
                  <label htmlFor="index" className="text-sm text-gray-700">Allow search engines to index this page</label>
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="follow" checked={!nofollow} onChange={(e) => setNofollow(!e.target.checked)} className="w-4 h-4 text-[#1A2551] rounded border-gray-300 focus:ring-[#1A2551]" />
                  <label htmlFor="follow" className="text-sm text-gray-700">Allow search engines to follow links</label>
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="sitemap" checked={sitemapEnabled} onChange={(e) => setSitemapEnabled(e.target.checked)} className="w-4 h-4 text-[#1A2551] rounded border-gray-300 focus:ring-[#1A2551]" />
                  <label htmlFor="sitemap" className="text-sm text-gray-700">Include in XML sitemap</label>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Publishing Settings</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Page Status</label>
                <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2551] focus:border-transparent" value={pageStatus} onChange={(e) => setPageStatus(e.target.value as 'published' | 'draft')}>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
            <Button onClick={() => setEditingPage(null)} variant="outline" className="flex-1 h-11">Cancel</Button>
            <Button onClick={handleSaveSettings} className="flex-1 h-11 bg-[#1A2551] text-white hover:bg-[#1A2551]/90">Save SEO Settings</Button>
          </div>
        </div>
      </div>
    );
  }

  // Pages List View
  return (
    <CMSPageLayout
      title="Pages & SEO"
      description="Manage SEO settings for all website pages."
      actions={[
        {
          label: "Global Settings",
          icon: Settings,
          onClick: () => setShowGlobalSettings(true),
          variant: "outline"
        }
      ]}
    >

      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Individual Pages</h2>
        {renderTable(individualPages)}
      </div>

      <div className="mb-6">
        <button onClick={() => toggleGroup('areas')} className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-3 hover:text-[#1A2551] transition-colors">
          {expandedGroups.has('areas') ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          Area Guides ({areaPages.length})
        </button>
        {expandedGroups.has('areas') && renderTable(areaPages)}
      </div>

      <div className="mb-6">
        <button onClick={() => toggleGroup('properties')} className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-3 hover:text-[#1A2551] transition-colors">
          {expandedGroups.has('properties') ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          Properties Pages ({propertyPages.length})
        </button>
        {expandedGroups.has('properties') && renderTable(propertyPages)}
      </div>

      <div className="mb-6">
        <button onClick={() => toggleGroup('blog')} className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-3 hover:text-[#1A2551] transition-colors">
          {expandedGroups.has('blog') ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          Blog Pages ({blogPages.length})
        </button>
        {expandedGroups.has('blog') && renderTable(blogPages)}
      </div>

      <div className="mb-6">
        <button onClick={() => toggleGroup('other')} className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-3 hover:text-[#1A2551] transition-colors">
          {expandedGroups.has('other') ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          Other Pages ({otherPages.length})
        </button>
        {expandedGroups.has('other') && renderTable(otherPages)}
      </div>
    </CMSPageLayout>
  );
}

// Mock static pages for demonstration purposes
function getMockStaticPages(): StaticPage[] {
  const now = Date.now();
  return [
    {
      id: now + 1,
      name: 'Home',
      slug: '/',
      meta_title: 'Estate Agents Richmond, Twickenham & Teddington | Bartlett & Partners',
      meta_description: 'Independent estate agents in Richmond, Twickenham and Teddington. Director-led service with 30+ years experience. Book your free valuation today.',
      keywords: 'estate agents Richmond, estate agents Twickenham, estate agents Teddington, property for sale, luxury real estate',
      og_image: null,
      noindex: false,
      nofollow: false,
      sitemap_enabled: true,
      status: 'published',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      page_group: null
    },
    {
      id: now + 2,
      name: 'About',
      slug: '/about',
      meta_title: 'About Us | Estate Agents Richmond | Bartlett & Partners',
      meta_description: 'Meet Darren Bartlett and the team. 30+ years selling homes in Richmond, Twickenham and Teddington. Director-led service, honest advice, exceptional results.',
      keywords: 'about estate agents, Richmond estate agents, boutique agency, director-led service',
      og_image: null,
      noindex: false,
      nofollow: false,
      sitemap_enabled: true,
      status: 'published',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      page_group: null
    },
    {
      id: now + 3,
      name: 'Properties',
      slug: '/properties',
      meta_title: 'Property for Sale Richmond, Twickenham & Teddington | Bartlett & Partners',
      meta_description: 'Browse homes for sale in Richmond, Twickenham, Teddington, Kew and Ham. Family houses, period properties and riverside homes. View our current listings.',
      keywords: 'property for sale, houses for sale Twickenham, homes for sale Richmond, Teddington property, luxury properties',
      og_image: null,
      noindex: false,
      nofollow: false,
      sitemap_enabled: true,
      status: 'published',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      page_group: null
    },
    {
      id: now + 4,
      name: 'Insights',
      slug: '/insights',
      meta_title: 'Property Insights & News | Bartlett & Partners',
      meta_description: 'Expert insights, market trends and property news from our team of real estate professionals.',
      keywords: 'property insights, real estate news, market trends, property blog',
      og_image: null,
      noindex: false,
      nofollow: false,
      sitemap_enabled: true,
      status: 'published',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      page_group: null
    },
    {
      id: now + 5,
      name: 'Contact',
      slug: '/contact',
      meta_title: 'Contact Us | Estate Agents Teddington | Bartlett & Partners',
      meta_description: 'Get in touch with Bartlett & Partners. Based in Teddington, serving Richmond, Twickenham and surrounding areas. Call 020 8614 1441 or book a free valuation.',
      keywords: 'contact estate agent, Teddington, Richmond, property enquiry',
      og_image: null,
      noindex: false,
      nofollow: false,
      sitemap_enabled: true,
      status: 'published',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      page_group: null
    },
    {
      id: now + 20,
      name: 'Kew Area Guide',
      slug: '/kew',
      meta_title: 'Estate Agents Kew | Property for Sale | Bartlett & Partners',
      meta_description: 'Property for sale in Kew, southwest London. Period homes near Kew Gardens. Experienced local estate agents. Book your free property valuation today.',
      keywords: 'Kew property, Kew homes, Royal Botanic Gardens, estate agents Kew',
      og_image: null,
      noindex: false,
      nofollow: false,
      sitemap_enabled: true,
      status: 'published',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      page_group: 'areas'
    },
    {
      id: now + 21,
      name: 'Teddington Area Guide',
      slug: '/teddington',
      meta_title: 'Estate Agents Teddington | Property for Sale | Bartlett & Partners',
      meta_description: 'Teddington property specialists based on Church Road. Family homes, riverside properties & period houses. Book your free valuation with local experts.',
      keywords: 'Teddington property, Teddington homes, estate agents Teddington, Thames riverside',
      og_image: null,
      noindex: false,
      nofollow: false,
      sitemap_enabled: true,
      status: 'published',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      page_group: 'areas'
    },
    {
      id: now + 22,
      name: 'Twickenham Area Guide',
      slug: '/twickenham',
      meta_title: 'Estate Agents Twickenham | Property for Sale | Bartlett & Partners',
      meta_description: 'Twickenham property experts. Family homes, period houses & riverside properties for sale. Local estate agents with 30+ years experience. Free valuations.',
      keywords: 'Twickenham property, Twickenham homes, estate agents Twickenham, rugby town',
      og_image: null,
      noindex: false,
      nofollow: false,
      sitemap_enabled: true,
      status: 'published',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      page_group: 'areas'
    },
    {
      id: now + 23,
      name: 'Ham Area Guide',
      slug: '/ham',
      meta_title: 'Estate Agents Ham | Property for Sale Richmond | Bartlett & Partners',
      meta_description: 'Property for sale in Ham, near Richmond Park. Family homes in a village setting. Local estate agents with 30+ years experience. Free valuations.',
      keywords: 'Ham property, Ham Richmond homes, Ham Common, Richmond Park',
      og_image: null,
      noindex: false,
      nofollow: false,
      sitemap_enabled: true,
      status: 'published',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      page_group: 'areas'
    }
  ];
}