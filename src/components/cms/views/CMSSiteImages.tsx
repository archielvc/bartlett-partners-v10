import { useState, useEffect } from 'react';
import { Save, Layout, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { get, set } from '../../../utils/kvStore';
import { CMSPageLayout } from '../CMSPageLayout';
import { CMSImageUpload } from '../CMSImageUpload';
import { clearSiteImageCache } from '../../../hooks/useSiteImage';
import { useSiteSettings } from '../../../contexts/SiteContext';

type ImageSection = 'branding' | 'about' | 'contact' | 'properties' | 'insights' | 'locations';

interface ImageBlock {
  id: string;
  label: string;
  value: string;
  description: string;
  fallback?: string;
  alt?: string;
}

const DEFAULT_IMAGES: Record<ImageSection, ImageBlock[]> = {
  branding: [
    {
      id: 'brand_logo_dark',
      label: 'Dark Logo',
      value: '',
      description: 'The dark version of the logo used on light backgrounds, such as the navigation bar when scrolling, document headers, and white content sections.',
      alt: 'Bartlett & Partners logo'
    },
    {
      id: 'brand_logo_white',
      label: 'White Logo',
      value: '',
      description: 'The white version of the logo used on dark backgrounds, primarily in the transparent navigation bar over hero images and in the footer.',
      alt: 'Bartlett & Partners logo'
    },
    {
      id: 'brand_logo_load',
      label: 'Load Screen Logo',
      value: '',
      description: 'The logo used exclusively on the initial loading screen. If not set, it defaults to the White Logo.',
      alt: 'Bartlett & Partners loading logo'
    },
  ],

  about: [
    {
      id: 'a_hero_bg',
      label: 'About Hero',
      value: '',
      description: 'The full-width banner image at the very top of the About Us page, displayed behind the "About Us" title.',
      alt: 'Bartlett & Partners team and office'
    },
    {
      id: 'a_story_img',
      label: 'Our Philosophy Image',
      value: '',
      description: 'Image illustrating "The power of saying no" section on the About Us page.',
      alt: 'Selective property curation'
    },
    {
      id: 'a_approach_img',
      label: 'Approach Section Image',
      value: '',
      description: 'The supporting image for the "Our Approach" section. It illustrates the company philosophy and appears next to the methodology text.',
      alt: 'Personal property consultation'
    },
    {
      id: 'a_approach_decor',
      label: 'Approach Decorative Image',
      value: '',
      description: 'The small decorative image/texture in the "The SELLS Strategy" section.',
      alt: 'Abstract architecture'
    },
    {
      id: 'a_val_1',
      label: 'Value: Our Service',
      value: '',
      description: 'Image for the "Our Service / Art of Silence" section.',
      alt: 'Discreet premium service'
    },
    {
      id: 'a_val_2',
      label: 'Value: Quality',
      value: '',
      description: 'Image for the "Quality over Quantity" section.',
      alt: 'Quality property selection'
    },
    {
      id: 'a_val_3',
      label: 'Value: Relentless',
      value: '',
      description: 'Image for the "Relentless Pursuit" section.',
      alt: 'Dedicated property search'
    }
  ],
  properties: [
    {
      id: 'p_hero_bg',
      label: 'Properties Hero',
      value: '',
      description: 'The full-width banner image at the top of the main Property Listing page (Lettings & Sales).',
      alt: 'Premium property portfolio'
    }
  ],
  insights: [
    {
      id: 'i_hero_bg',
      label: 'Insights Hero',
      value: '',
      description: 'The full-width banner image at the top of the News & Insights page.',
      alt: 'Property market insights'
    }
  ],
  contact: [
    {
      id: 'c_hero_bg',
      label: 'Contact Hero',
      value: '',
      description: 'The full-width banner image at the top of the Contact page.',
      alt: 'Contact Bartlett & Partners'
    },
  ],
  locations: [
    {
      id: 'l_twickenham',
      label: 'Twickenham Image',
      value: '',
      description: 'The main image for Twickenham, used for both the home page thumbnail and the area guide hero section.',
      alt: 'Twickenham neighbourhood'
    },
    {
      id: 'l_teddington',
      label: 'Teddington Image',
      value: '',
      description: 'The main image for Teddington, used for both the home page thumbnail and the area guide hero section.',
      alt: 'Teddington neighbourhood'
    },
    {
      id: 'l_st_margarets',
      label: 'St Margarets Image',
      value: '',
      description: 'The main image for St Margarets, used for both the home page thumbnail and the area guide hero section.',
      alt: 'St Margarets neighbourhood'
    },
    {
      id: 'l_kew',
      label: 'Kew Image',
      value: '',
      description: 'The main image for Kew, used for both the home page thumbnail and the area guide hero section.',
      alt: 'Kew neighbourhood'
    },
    {
      id: 'l_ham',
      label: 'Ham Image',
      value: '',
      description: 'The main image for Ham, used for both the home page thumbnail and the area guide hero section.',
      alt: 'Ham neighbourhood'
    }
  ]
};

const KV_KEY = 'site_images';

export function CMSSiteImages() {
  const [activeSection, setActiveSection] = useState<ImageSection>('branding');
  const [images, setImages] = useState(DEFAULT_IMAGES);
  const [isLoading, setIsLoading] = useState(true);
  const { refreshImages } = useSiteSettings();

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      const data = await get<Record<ImageSection, ImageBlock[]>>(KV_KEY);
      if (data) {
        // Merge with defaults to ensure new fields appear
        const merged: any = { ...DEFAULT_IMAGES };

        Object.keys(DEFAULT_IMAGES).forEach(key => {
          const sectionKey = key as ImageSection;
          const savedSection = data[sectionKey] || [];
          const defaultSection = DEFAULT_IMAGES[sectionKey];

          // Merge arrays based on ID
          merged[sectionKey] = defaultSection.map(defItem => {
            const savedItem = savedSection.find((s: ImageBlock) => s.id === defItem.id);
            return savedItem ? { ...defItem, value: savedItem.value } : defItem;
          });
        });

        setImages(merged);
      }
    } catch (error) {
      console.error('Failed to load site images', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = (section: ImageSection, id: string, field: 'value' | 'alt', newValue: string) => {
    setImages(prev => ({
      ...prev,
      [section]: prev[section].map(block =>
        block.id === id ? { ...block, [field]: newValue } : block
      )
    }));
  };

  const handleSave = async () => {
    try {
      await set(KV_KEY, images);
      toast.success('Site images updated successfully');
      clearSiteImageCache();
      // Refresh SiteContext so changes appear on the live site immediately
      await refreshImages();
    } catch (error) {
      toast.error('Failed to save changes');
    }
  };

  // Calculate missing images count
  const { missingCount, totalCount } = Object.values(images).reduce(
    (acc, section) => {
      section.forEach((block) => {
        acc.totalCount++;
        if (!block.value) {
          acc.missingCount++;
        }
      });
      return acc;
    },
    { missingCount: 0, totalCount: 0 }
  );

  return (
    <CMSPageLayout
      title="Site Images"
      description={`Manage and update images across the website. ${missingCount > 0 ? `${missingCount} of ${totalCount} images missing.` : 'All images uploaded.'}`}
      action={{ label: "Save Changes", icon: Save, onClick: handleSave }}
    >
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation for Sections */}
        <div className="w-full lg:w-64 shrink-0 space-y-1">
          {(Object.keys(images) as ImageSection[]).map((section) => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeSection === section
                ? 'bg-[#1A2551] text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-transparent hover:border-gray-200'
                }`}
            >
              <Layout className="w-4 h-4" />
              <span className="capitalize font-medium">{section}</span>
            </button>
          ))}
        </div>

        {/* Editor Area */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 capitalize border-b border-gray-100 pb-4 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-gray-500" />
            {activeSection === 'branding' ? 'Brand Assets' : `${activeSection} Images`}
          </h2>

          <div className="space-y-12">
            {images[activeSection].map((block) => (
              <div key={block.id} className="space-y-4 pb-8 border-b border-gray-100 last:border-0 last:pb-0">
                <CMSImageUpload
                  label={block.label}
                  description={block.description}
                  value={block.value || block.fallback || ''}
                  onChange={(url) => handleUpdate(activeSection, block.id, 'value', url)}
                  initialAlt={block.alt || ''}
                  onAltChange={(alt) => handleUpdate(activeSection, block.id, 'alt', alt)}
                  folder={activeSection}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </CMSPageLayout>
  );
}