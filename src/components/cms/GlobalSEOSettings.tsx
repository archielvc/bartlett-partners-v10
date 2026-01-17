import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, Search, ExternalLink, ChevronRight, Check } from 'lucide-react';
import { toast } from 'sonner';
import { get, set } from '../../utils/kvStore';
import { CMSImageUpload } from './CMSImageUpload';
import { getAllPropertiesAdminLight, updateProperty } from '../../utils/database';
import type { Property } from '../../types/database';

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
    defaultOgImage?: string;
}

type Tab = 'defaults' | 'properties';

export default function GlobalSEOSettings() {
    const [activeTab, setActiveTab] = useState<Tab>('defaults');
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState<GlobalSEODefaults>(DEFAULT_SEO_SETTINGS);
    const [generalSettings, setGeneralSettings] = useState<GeneralSEOSettings>({});
    const [hasChanges, setHasChanges] = useState(false);

    // Properties State
    const [properties, setProperties] = useState<Partial<Property>[]>([]);
    const [loadingProperties, setLoadingProperties] = useState(false);
    const [propertySearch, setPropertySearch] = useState('');
    const [editingPropertyId, setEditingPropertyId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<{
        meta_title?: string;
        meta_description?: string;
        slug?: string;
    }>({});

    useEffect(() => {
        loadSettings();
    }, []);

    useEffect(() => {
        if (activeTab === 'properties' && properties.length === 0) {
            loadProperties();
        }
    }, [activeTab]);

    async function loadSettings() {
        try {
            setLoading(true);
            const savedSettings = await get<GlobalSEODefaults>('global_seo_defaults');
            if (savedSettings) {
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

    async function loadProperties() {
        setLoadingProperties(true);
        try {
            const data = await getAllPropertiesAdminLight();
            setProperties(data);
        } catch (error) {
            console.error('Failed to load properties', error);
            toast.error('Failed to load properties');
        } finally {
            setLoadingProperties(false);
        }
    }

    const handleSaveDefaults = async () => {
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

    const handleSaveProperty = async (id: number) => {
        if (!editForm) return;

        try {
            const success = await updateProperty(id, editForm);
            if (success) {
                toast.success('Property SEO updated');

                // Update local state
                setProperties(prev => prev.map(p =>
                    p.id === id ? { ...p, ...editForm } : p
                ));

                setEditingPropertyId(null);
                setEditForm({});
            } else {
                toast.error('Failed to update property');
            }
        } catch (error) {
            console.error('Error updating property:', error);
            toast.error('Failed to update property');
        }
    };

    const startEditing = (property: Partial<Property>) => {
        setEditingPropertyId(property.id || null);
        setEditForm({
            meta_title: property.meta_title || '',
            meta_description: property.meta_description || '',
            slug: property.slug || ''
        });
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
                            checked={!settings[type].noindex}
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
                            checked={!settings[type].nofollow}
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

    const filteredProperties = properties.filter(p =>
        p.title?.toLowerCase().includes(propertySearch.toLowerCase()) ||
        p.slug?.toLowerCase().includes(propertySearch.toLowerCase())
    );

    if (loading && !settings) return <div className="p-8 text-center text-gray-500">Loading settings...</div>;

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">SEO Management</h1>
                    <p className="text-gray-600 mt-1">Manage global defaults and individual property SEO.</p>
                </div>

                {activeTab === 'defaults' && (
                    <button
                        onClick={handleSaveDefaults}
                        disabled={!hasChanges || loading}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${hasChanges
                            ? 'bg-[#1A2551] text-white hover:bg-[#0F1633]'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        {loading ? <span className="animate-spin mr-2">⟳</span> : <Save className="w-4 h-4" />}
                        Save Defaults
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 mb-6 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('defaults')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'defaults'
                            ? 'border-[#1A2551] text-[#1A2551]'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Global Defaults
                </button>
                <button
                    onClick={() => setActiveTab('properties')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'properties'
                            ? 'border-[#1A2551] text-[#1A2551]'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Properties SEO
                </button>
            </div>

            {activeTab === 'defaults' ? (
                // Defaults View
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {renderSection('Blog Posts', 'blog', 'Default settings for new blog articles')}
                        {renderSection('Properties', 'property', 'Default settings for new property listings')}
                        {renderSection('Static Pages', 'static', 'Default settings for new core pages')}

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
                                <CMSImageUpload
                                    label="Default OG Image"
                                    description="Default Open Graph image for social sharing. Recommended: 1200x630px. Used when pages don't have specific OG images."
                                    value={generalSettings.defaultOgImage || ''}
                                    onChange={(url) => {
                                        setGeneralSettings(prev => ({ ...prev, defaultOgImage: url }));
                                        setHasChanges(true);
                                    }}
                                    variant="stack"
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
                </>
            ) : (
                // Properties SEO View
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search properties..."
                                value={propertySearch}
                                onChange={(e) => setPropertySearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1A2551] focus:border-transparent"
                            />
                        </div>
                        <div className="text-sm text-gray-500">
                            Showing {filteredProperties.length} properties
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Property</th>
                                    <th className="px-6 py-3 font-medium">Meta Title</th>
                                    <th className="px-6 py-3 font-medium">Meta Description</th>
                                    <th className="px-6 py-3 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {loadingProperties ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                            Loading properties...
                                        </td>
                                    </tr>
                                ) : filteredProperties.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                            No properties found matching your search.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredProperties.map((property) => (
                                        <tr key={property.id} className="hover:bg-gray-50/50">
                                            <td className="px-6 py-4 w-1/4">
                                                <div className="font-medium text-gray-900 truncate" title={property.title}>
                                                    {property.title}
                                                </div>
                                                <div className="flex items-center gap-1 mt-1 text-xs text-xs text-gray-500">
                                                    {editingPropertyId === property.id ? (
                                                        <div className="flex items-center gap-1">
                                                            <span className="font-mono text-gray-400">/properties/</span>
                                                            <input
                                                                type="text"
                                                                value={editForm.slug}
                                                                onChange={(e) => setEditForm(prev => ({ ...prev, slug: e.target.value }))}
                                                                className="border border-gray-300 rounded px-1 py-0.5 text-xs font-mono"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <a
                                                            href={`/properties/${property.slug}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-1 hover:text-blue-600"
                                                        >
                                                            <span className="truncate max-w-[200px]">{property.slug}</span>
                                                            <ExternalLink className="w-3 h-3" />
                                                        </a>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Editable Meta Title */}
                                            <td className="px-6 py-4 w-1/4">
                                                {editingPropertyId === property.id ? (
                                                    <textarea
                                                        value={editForm.meta_title}
                                                        onChange={(e) => setEditForm(prev => ({ ...prev, meta_title: e.target.value }))}
                                                        className="w-full text-sm border border-gray-300 rounded p-2 focus:ring-2 focus:ring-[#1A2551] min-h-[60px]"
                                                        placeholder="Meta Title"
                                                    />
                                                ) : (
                                                    <div className="text-gray-600 line-clamp-2" title={property.meta_title || ''}>
                                                        {property.meta_title || <span className="italic text-gray-400">Auto-generated</span>}
                                                    </div>
                                                )}
                                            </td>

                                            {/* Editable Meta Description */}
                                            <td className="px-6 py-4 w-1/3">
                                                {editingPropertyId === property.id ? (
                                                    <textarea
                                                        value={editForm.meta_description}
                                                        onChange={(e) => setEditForm(prev => ({ ...prev, meta_description: e.target.value }))}
                                                        className="w-full text-sm border border-gray-300 rounded p-2 focus:ring-2 focus:ring-[#1A2551] min-h-[80px]"
                                                        placeholder="Meta Description"
                                                    />
                                                ) : (
                                                    <div className="text-gray-600 line-clamp-3" title={property.meta_description || ''}>
                                                        {property.meta_description || <span className="italic text-gray-400">Auto-generated</span>}
                                                    </div>
                                                )}
                                            </td>

                                            <td className="px-6 py-4 text-right">
                                                {editingPropertyId === property.id ? (
                                                    <div className="flex flex-col gap-2 items-end">
                                                        <button
                                                            onClick={() => handleSaveProperty(property.id!)}
                                                            className="flex items-center gap-1 text-xs bg-[#1A2551] text-white px-3 py-1.5 rounded hover:bg-[#1A2551]/90 transition-colors"
                                                        >
                                                            <Save className="w-3 h-3" />
                                                            Save
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setEditingPropertyId(null);
                                                                setEditForm({});
                                                            }}
                                                            className="text-xs text-gray-500 hover:text-gray-700 underline"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => startEditing(property)}
                                                        className="text-[#1A2551] hover:text-[#1A2551]/80 font-medium text-sm"
                                                    >
                                                        Edit
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
