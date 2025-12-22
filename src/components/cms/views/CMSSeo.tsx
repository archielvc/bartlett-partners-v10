import { useState, useEffect } from 'react';
import { Save, Globe, AlertCircle, CheckCircle, Settings as SettingsIcon, Image as ImageIcon, FileCode, Share2, Layout, Search, Plus, Trash2, ArrowRight, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { getGlobalSettings as getDBSettings, setGlobalSettings as setDBSettings } from '../../../utils/database';
import { CMSPageLayout } from '../CMSPageLayout';
import { Button } from '../../ui/button';
import { ImageWithFallback } from '../../figma/ImageWithFallback';

interface SEOSetting {
  page_route: string;
  title: string;
  description: string;
  keywords: string[];
  url_slug?: string;
  og_image?: string;
}

interface GlobalSEOSettings {
  siteName: string;
  titleTemplate: string; // e.g. "%s | Bartlett & Partners"
  defaultDescription: string;
  defaultKeywords: string[];
  googleAnalyticsId: string;
  heatmapId: string;
  facebookAppId?: string;
  twitterHandle?: string;
  organizationLogo?: string;
}

const SEO_KEY = 'seo_settings';
const SEO_GLOBAL_KEY = 'seo_global';

export function CMSSeo() {
  const [settings, setSettings] = useState<SEOSetting[]>([]);
  const [globalSettings, setGlobalSettings] = useState<GlobalSEOSettings>({
    siteName: 'Bartlett & Partners',
    titleTemplate: '%s | Bartlett & Partners',
    defaultDescription: 'Luxury property sales and lettings in Richmond, Surrey, and London.',
    defaultKeywords: ['luxury', 'real estate', 'richmond'],
    googleAnalyticsId: '',
    heatmapId: ''
  });
  const [selectedPage, setSelectedPage] = useState<string>('/');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'pages' | 'global' | 'images' | 'schema'>('pages');

  // Current editing state
  const [formData, setFormData] = useState<Partial<SEOSetting>>({});

  // Mock Image Data for Audit
  const [auditImages, setAuditImages] = useState([
    { id: 1, url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400', name: 'townhouse-exterior.jpg', alt: 'Luxury townhouse exterior in Richmond', status: 'ok' },
    { id: 2, url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400', name: 'townhouse-living.jpg', alt: '', status: 'missing' },
    { id: 3, url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400', name: 'riverside-apt.jpg', alt: 'Riverside apartment view', status: 'ok' },
    { id: 4, url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400', name: 'IMG_29384.jpg', alt: '', status: 'warning' }, // warning for bad filename
  ]);

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    const pageSettings = settings.find(s => s.page_route === selectedPage);
    if (pageSettings) {
      setFormData(pageSettings);
    } else {
      setFormData({ page_route: selectedPage, title: '', description: '', keywords: [], url_slug: '' });
    }
  }, [selectedPage, settings]);

  const loadSettings = async () => {
    try {
      const [data, globalData] = await Promise.all([
        getDBSettings<SEOSetting[]>(SEO_KEY),
        getDBSettings<GlobalSEOSettings>(SEO_GLOBAL_KEY)
      ]);

      if (data) setSettings(data);
      if (globalData) setGlobalSettings(globalData);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load settings');
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'pages') {
        const newSettings = [...settings];
        const index = newSettings.findIndex(s => s.page_route === selectedPage);

        const updatedItem = {
          page_route: selectedPage,
          title: formData.title || '',
          description: formData.description || '',
          keywords: formData.keywords || [],
          url_slug: formData.url_slug || '',
          og_image: formData.og_image
        };

        if (index >= 0) {
          newSettings[index] = updatedItem;
        } else {
          newSettings.push(updatedItem);
        }

        await setDBSettings(SEO_KEY, newSettings);
        setSettings(newSettings);
      } else {
        await setDBSettings(SEO_GLOBAL_KEY, globalSettings);
      }

      // Clear cache to ensure SEO changes are reflected immediately on the live site
      const { clearCache } = await import('../../../utils/database');
      clearCache();
      console.log('✅ SEO settings saved, cache cleared');

      toast.success('SEO settings updated successfully');
    } catch (err) {
      toast.error('Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  const updateImageAlt = (id: number, newAlt: string) => {
    setAuditImages(prev => prev.map(img =>
      img.id === id ? { ...img, alt: newAlt, status: newAlt ? 'ok' : 'missing' } : img
    ));
  };

  const pages = [
    { route: '/', name: 'Home' },
    { route: '/about', name: 'About Us' },
    { route: '/properties', name: 'Properties' },
    { route: '/insights', name: 'Insights' },
    { route: '/contact', name: 'Contact' },

    { route: '/area-guides/kew', name: 'Area Guide: Kew' },
    { route: '/area-guides/teddington', name: 'Area Guide: Teddington' },
    { route: '/area-guides/twickenham', name: 'Area Guide: Twickenham' },
    { route: '/area-guides/richmond', name: 'Area Guide: Richmond' },
    { route: '/area-guides/ham', name: 'Area Guide: Ham' }
  ];

  const TabButton = ({ id, label, icon: Icon }: any) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all border-b-2 ${activeTab === id
        ? 'border-[#1A2551] text-[#1A2551]'
        : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
        }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );

  return (
    <CMSPageLayout
      title="SEO Suite"
      description="Optimize your search engine presence, image metadata, and structured data."
      action={{ label: "Save Changes", icon: Save, onClick: handleSave }}
    >
      <div className="flex flex-col gap-8">
        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 bg-white rounded-t-xl px-2">
          <TabButton id="pages" label="Page Settings" icon={Layout} />
          <TabButton id="images" label="Image Audit" icon={ImageIcon} />
          <TabButton id="global" label="Global & Analytics" icon={Globe} />
          <TabButton id="schema" label="Structured Data" icon={FileCode} />
        </div>

        {/* PAGE SETTINGS TAB */}
        {activeTab === 'pages' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
            <div className="col-span-1 space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <h3 className="font-semibold text-[#1A2551]">Site Pages</h3>
                </div>
                <div className="p-2">
                  {pages.map(page => (
                    <button
                      key={page.route}
                      onClick={() => setSelectedPage(page.route)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg text-sm transition-colors ${selectedPage === page.route
                        ? 'bg-[#1A2551]/5 text-[#1A2551] font-medium'
                        : 'text-gray-500 hover:bg-gray-50'
                        }`}
                    >
                      <span className="flex items-center gap-3">
                        <Globe className="w-4 h-4 opacity-50" />
                        {page.name}
                      </span>
                      {settings.find(s => s.page_route === page.route)?.title ? (
                        <CheckCircle className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <AlertCircle className="w-3 h-3 text-amber-500" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#1A2551] to-[#2A3561] text-white p-6 rounded-xl shadow-lg">
                <h3 className="font-medium mb-4 flex items-center gap-2">
                  <Search className="w-4 h-4" /> SEO Health Check
                </h3>
                <div className="space-y-4 text-sm">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="text-white/70">Sitemap.xml</span>
                    <span className="text-emerald-400 flex items-center gap-1 text-xs bg-emerald-400/10 px-2 py-1 rounded-full">
                      <CheckCircle className="w-3 h-3" /> Valid
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="text-white/70">Robots.txt</span>
                    <span className="text-emerald-400 flex items-center gap-1 text-xs bg-emerald-400/10 px-2 py-1 rounded-full">
                      <CheckCircle className="w-3 h-3" /> Valid
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Indexing Status</span>
                    <span className="text-emerald-400 flex items-center gap-1 text-xs bg-emerald-400/10 px-2 py-1 rounded-full">
                      <CheckCircle className="w-3 h-3" /> Active
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-span-1 lg:col-span-2 space-y-6">
              <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-[#1A2551]">
                  Editing: <span className="text-[#C5A059]">{pages.find(p => p.route === selectedPage)?.name}</span>
                </h2>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Meta Title</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.title || ''}
                          onChange={e => setFormData({ ...formData, title: e.target.value })}
                          className="w-full p-3 border border-gray-300 rounded-lg pr-16 focus:outline-none focus:ring-2 focus:ring-[#1A2551]/20 focus:border-[#1A2551] transition-all"
                          placeholder="e.g. Luxury Homes in Twickenham | Bartlett & Partners"
                        />
                        <span className={`absolute right-3 top-3.5 text-xs font-medium ${(formData.title?.length || 0) > 60 ? 'text-red-500' : 'text-emerald-600'
                          }`}>
                          {formData.title?.length || 0}/60
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Canonical URL Slug</label>
                      <div className="flex items-center">
                        <span className="bg-gray-50 border border-r-0 border-gray-300 rounded-l-lg p-3 text-gray-500 text-sm font-mono">bartlettandpartners.com/</span>
                        <input
                          type="text"
                          value={formData.url_slug || ''}
                          onChange={e => setFormData({ ...formData, url_slug: e.target.value })}
                          className="w-full p-3 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-[#1A2551]/20 focus:border-[#1A2551] transition-all font-mono text-sm"
                          placeholder={selectedPage === '/' ? '' : selectedPage.replace('/', '')}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Meta Description</label>
                      <div className="relative">
                        <textarea
                          rows={3}
                          value={formData.description || ''}
                          onChange={e => setFormData({ ...formData, description: e.target.value })}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A2551]/20 focus:border-[#1A2551] transition-all resize-none"
                          placeholder="A brief summary of the page content..."
                        />
                        <span className={`absolute right-3 bottom-3 text-xs font-medium ${(formData.description?.length || 0) > 160 ? 'text-red-500' : 'text-emerald-600'
                          }`}>
                          {formData.description?.length || 0}/160
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Keywords (Comma separated)</label>
                      <input
                        type="text"
                        value={formData.keywords?.join(', ') || ''}
                        onChange={e => setFormData({ ...formData, keywords: e.target.value.split(',').map(s => s.trim()) })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A2551]/20 focus:border-[#1A2551] transition-all"
                        placeholder="luxury, real estate, london..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Google Preview */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Search className="w-4 h-4" /> SERP Preview
                </h3>
                <div className="bg-white p-4 rounded-lg border border-gray-100 max-w-2xl hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <img src="/favicon.ico" className="w-5 h-5 opacity-50" alt="" onError={(e) => e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-globe"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>'} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-[#202124]">Bartlett & Partners</span>
                      <span className="text-xs text-[#5f6368]">
                        bartlettandpartners.com{formData.url_slug ? ` › ${formData.url_slug}` : selectedPage === '/' ? '' : ` › ${selectedPage.replace('/', '')}`}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-xl text-[#1a0dab] hover:underline cursor-pointer truncate mb-1 font-medium">
                    {formData.title || 'Page Title'}
                  </h3>
                  <p className="text-sm text-[#4d5156] line-clamp-2 leading-relaxed">
                    {formData.description || 'Meta description will appear here. This is how your page will look in Google search results.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* IMAGE AUDIT TAB */}
        {activeTab === 'images' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in duration-300">
            <div className="p-6 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-[#1A2551]">Image SEO Audit</h2>
                <p className="text-sm text-gray-500">Identify and fix missing alt text and poor filenames.</p>
              </div>
              <div className="flex gap-2">
                <div className="px-3 py-1 bg-white border border-gray-200 rounded-md text-xs font-medium text-gray-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Optimized: {auditImages.filter(i => i.status === 'ok').length}
                </div>
                <div className="px-3 py-1 bg-white border border-red-200 rounded-md text-xs font-medium text-red-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span> Issues: {auditImages.filter(i => i.status !== 'ok').length}
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50/50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">Preview</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Filename / URL</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/3">Alt Text (Required)</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {auditImages.map((img) => (
                    <tr key={img.id} className="hover:bg-[#F5F6F8] transition-colors group">
                      <td className="py-4 px-6">
                        <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden border border-gray-200">
                          <ImageWithFallback src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-medium text-gray-900 text-sm truncate max-w-[200px]" title={img.name}>{img.name}</div>
                        <div className="text-xs text-gray-500 font-mono mt-1 truncate max-w-[200px] opacity-60">{img.url}</div>
                        {img.status === 'warning' && (
                          <span className="text-[10px] text-amber-600 mt-1 block">Filename not descriptive</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <input
                          type="text"
                          value={img.alt}
                          onChange={(e) => updateImageAlt(img.id, e.target.value)}
                          placeholder="Describe this image..."
                          className={`w-full p-2 text-sm border rounded-md transition-colors ${!img.alt ? 'border-red-300 bg-red-50 focus:border-red-500' : 'border-gray-200 focus:border-[#1A2551]'
                            }`}
                        />
                      </td>
                      <td className="py-4 px-6">
                        {img.alt ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                            <CheckCircle className="w-3 h-3" /> Optimized
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <AlertCircle className="w-3 h-3" /> Missing Alt
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* GLOBAL & ANALYTICS TAB */}
        {activeTab === 'global' && (
          <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm max-w-4xl animate-in fade-in duration-300">
            <h2 className="text-xl font-semibold mb-6 text-[#1A2551]">Global Analytics & Tracking</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Google Analytics ID</label>
                  <input
                    type="text"
                    value={globalSettings.googleAnalyticsId}
                    onChange={e => setGlobalSettings({ ...globalSettings, googleAnalyticsId: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A2551]/20 focus:border-[#1A2551]"
                    placeholder="G-XXXXXXXXXX"
                  />
                  <p className="text-xs text-gray-400 mt-1">Your Google Analytics 4 Measurement ID.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Microsoft Clarity Project ID</label>
                  <input
                    type="text"
                    value={globalSettings.heatmapId}
                    onChange={e => setGlobalSettings({ ...globalSettings, heatmapId: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A2551]/20 focus:border-[#1A2551]"
                    placeholder="e.g. k8x7..."
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Facebook App ID</label>
                  <input
                    type="text"
                    value={globalSettings.facebookAppId || ''}
                    onChange={e => setGlobalSettings({ ...globalSettings, facebookAppId: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A2551]/20 focus:border-[#1A2551]"
                    placeholder="Optional"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Twitter Handle</label>
                  <div className="flex">
                    <span className="bg-gray-50 border border-r-0 border-gray-300 rounded-l-lg p-3 text-gray-500 text-sm">@</span>
                    <input
                      type="text"
                      value={globalSettings.twitterHandle || ''}
                      onChange={e => setGlobalSettings({ ...globalSettings, twitterHandle: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-[#1A2551]/20 focus:border-[#1A2551]"
                      placeholder="bartlettpartners"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STRUCTURED DATA TAB */}
        {activeTab === 'schema' && (
          <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm max-w-4xl animate-in fade-in duration-300">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-[#1A2551]">Organization Structured Data</h2>
                <p className="text-sm text-gray-500 mt-1">This helps Google understand your business details for Rich Results.</p>
              </div>
              <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-md text-xs font-medium">JSON-LD</div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Organization Logo URL</label>
                <div className="flex gap-4">
                  <div className="w-16 h-16 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-gray-300" />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={globalSettings.organizationLogo || ''}
                      onChange={e => setGlobalSettings({ ...globalSettings, organizationLogo: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A2551]/20 focus:border-[#1A2551]"
                      placeholder="https://..."
                    />
                    <p className="text-xs text-gray-400 mt-1">Must be 112x112px minimum, JPG or PNG.</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Organization Name</label>
                <input
                  type="text"
                  value={globalSettings.siteName}
                  onChange={e => setGlobalSettings({ ...globalSettings, siteName: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A2551]/20 focus:border-[#1A2551]"
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Preview (JSON-LD)</h4>
                <pre className="text-xs text-gray-600 font-mono bg-white p-3 rounded border border-gray-200 overflow-x-auto">
                  {`{
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  "name": "${globalSettings.siteName}",
  "logo": "${globalSettings.organizationLogo || 'https://...'}",
  "url": "https://bartlettandpartners.com",
  "sameAs": [
    "https://twitter.com/${globalSettings.twitterHandle || '...'}"
  ]
}`}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </CMSPageLayout>
  );
}