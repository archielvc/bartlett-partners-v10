
import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { get, set } from '../../utils/kvStore';
import { CMSImageUpload } from './CMSImageUpload';

interface PageTypeDefaults {
    noindex: boolean;
    nofollow: boolean;
    sitemap_enabled: boolean;
}

export interface GlobalSEODefaults {
    blog: PageTypeDefaults;
    property: PageTypeDefaults;
    static: PageTypeDefaults;
}

export const DEFAULT_SEO_SETTINGS: GlobalSEODefaults = {
    blog: { noindex: false, nofollow: false, sitemap_enabled: true },
    property: { noindex: false, nofollow: false, sitemap_enabled: true },
    static: { noindex: false, nofollow: false, sitemap_enabled: true },
};

interface GeneralSEOSettings {
    site_favicon?: string;
    siteName?: string;
}

export default function GlobalSEOSettings() {
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState<GlobalSEODefaults>(DEFAULT_SEO_SETTINGS);
    const [generalSettings, setGeneralSettings] = useState<GeneralSEOSettings>({});
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    async function loadSettings() {
        try {
            setLoading(true);
            const savedSettings = await get<GlobalSEODefaults>('global_seo_defaults');
            if (savedSettings) {
                // Merge with defaults to ensure structure is valid
                setSettings({
                    blog: { ...DEFAULT_SEO_SETTINGS.blog, ...savedSettings.blog },
                    property: { ...DEFAULT_SEO_SETTINGS.property, ...savedSettings.property },
                    static: { ...DEFAULT_SEO_SETTINGS.static, ...savedSettings.static },
                });
            }

            const savedGeneralSettings = await get<GeneralSEOSettings>('seo_global');
            if (savedGeneralSettings) {
                setGeneralSettings(savedGeneralSettings);
            }
        } catch (error) {
            console.error('Error loading global SEO settings:', error);
            toast.error('Failed to load settings');
        } finally {
            setLoading(false);
        }
    }

    const handleSave = async () => {
        try {
            setLoading(true);
            const [defaultsSuccess, generalSuccess] = await Promise.all([
                set('global_seo_defaults', settings),
                set('seo_global', generalSettings)
            ]);

            if (defaultsSuccess && generalSuccess) {
                toast.success('Global SEO settings saved');
                setHasChanges(false);
            } else {
                toast.error('Failed to save settings');
            }
        } catch (error) {
            console.error('Error saving global SEO settings:', error);
            toast.error('Failed to save settings');
        } finally {
            setLoading(false);
        }
    };

    const updateSetting = (
        type: keyof GlobalSEODefaults,
        field: keyof PageTypeDefaults,
        value: boolean
    ) => {
        setSettings(prev => ({
            ...prev,
            [type]: {
                ...prev[type],
                [field]: value
            }
        }));
        setHasChanges(true);
    };

    const renderSection = (title: string, type: keyof GlobalSEODefaults, description: string) => (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900">{title}</h3>
                <p className="text-sm text-gray-500">{description}</p>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id={`${type}-noindex`}
                            checked={!settings[type].noindex} // Checked means "Allow Indexing" (noindex = false)
                            onChange={(e) => updateSetting(type, 'noindex', !e.target.checked)}
                            className="w-4 h-4 text-[#1A2551] rounded border-gray-300 focus:ring-[#1A2551]"
                        />
                        <label htmlFor={`${type}-noindex`} className="text-sm text-gray-700">
                            Allow Indexing
                        </label>
                    </div>
                    <span className="text-xs text-gray-400">Default: {DEFAULT_SEO_SETTINGS[type].noindex ? 'No' : 'Yes'}</span>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id={`${type}-nofollow`}
                            checked={!settings[type].nofollow} // Checked means "Allow Follow" (nofollow = false)
                            onChange={(e) => updateSetting(type, 'nofollow', !e.target.checked)}
                            className="w-4 h-4 text-[#1A2551] rounded border-gray-300 focus:ring-[#1A2551]"
                        />
                        <label htmlFor={`${type}-nofollow`} className="text-sm text-gray-700">
                            Allow Following Links
                        </label>
                    </div>
                    <span className="text-xs text-gray-400">Default: {DEFAULT_SEO_SETTINGS[type].nofollow ? 'No' : 'Yes'}</span>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id={`${type}-sitemap`}
                            checked={settings[type].sitemap_enabled}
                            onChange={(e) => updateSetting(type, 'sitemap_enabled', e.target.checked)}
                            className="w-4 h-4 text-[#1A2551] rounded border-gray-300 focus:ring-[#1A2551]"
                        />
                        <label htmlFor={`${type}-sitemap`} className="text-sm text-gray-700">
                            Include in Sitemap
                        </label>
                    </div>
                    <span className="text-xs text-gray-400">Default: {DEFAULT_SEO_SETTINGS[type].sitemap_enabled ? 'Yes' : 'No'}</span>
                </div>
            </div>
        </div>
    );

    if (loading && !settings) return <div className="p-8 text-center text-gray-500">Loading settings...</div>;

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Global SEO Defaults</h1>
                    <p className="text-gray-600 mt-1">Configure default SEO behaviors for new content types.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={!hasChanges || loading}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${hasChanges
                        ? 'bg-[#1A2551] text-white hover:bg-[#0F1633]'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                >
                    {loading ? (
                        <span className="animate-spin mr-2">⟳</span>
                    ) : (
                        <Save className="w-4 h-4" />
                    )}
                    Save Changes
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderSection('Blog Posts', 'blog', 'Default settings for new blog articles')}
                {renderSection('Properties', 'property', 'Default settings for new property listings')}
                {renderSection('Static Pages', 'static', 'Default settings for new core pages')}

                {/* Site Identity Section */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Site Identity</h3>
                        <p className="text-sm text-gray-500">Manage global site assets.</p>
                    </div>

                    <div className="space-y-4">
                        <CMSImageUpload
                            label="Site Favicon"
                            description="Upload a 32x32px or 64x64px PNG or ICO image."
                            value={generalSettings.site_favicon || ''}
                            onChange={(url) => {
                                setGeneralSettings(prev => ({ ...prev, site_favicon: url }));
                                setHasChanges(true);
                            }}
                            variant="compact"
                        />
                    </div>
                </div>
            </div>

            <div className="mt-8 bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                <div>
                    <h4 className="text-sm font-medium text-blue-900">About Global Defaults</h4>
                    <p className="text-sm text-blue-800 mt-1">
                        These settings apply to <strong>newly created</strong> content only. Changing these defaults will not affect existing pages.
                        You can always override these settings on individual pages.
                    </p>
                </div>
            </div>
        </div>
    );
}
