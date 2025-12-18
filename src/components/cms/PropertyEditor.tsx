import { useState, useEffect, useRef } from 'react';
import {
  X, Save, Trash2, Home, MapPin, Image as ImageIcon, FileText, List, Search as SearchIcon,
  AlertCircle, Check, ChevronRight, GripVertical, Star, ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { CMSImageUpload } from './CMSImageUpload';
import { CMSMultiImageUpload } from './CMSMultiImageUpload';
import { CharacterCounter } from './CharacterCounter';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import type { Property } from '../../types/database';

interface PropertyEditorProps {
  property: Partial<Property> | null;
  onSave: (data: Partial<Property>, isDraft: boolean) => Promise<void>;
  onDelete?: () => Promise<void>;
  onCancel: () => void;
}

type Section = 'overview' | 'location' | 'media' | 'description' | 'seo';

export function PropertyEditor({ property, onSave, onDelete, onCancel }: PropertyEditorProps) {
  const [activeSection, setActiveSection] = useState<Section>('overview');
  const [formData, setFormData] = useState<Partial<Property>>(property || {});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const parentSlug = 'properties'; // Static - no need to fetch

  // Convert Google Maps URL to embed URL (simple version)
  const convertToEmbedUrl = (url: string): string => {
    if (!url) return '';

    // Extract coordinates or place from URL and create embed
    try {
      // Try to extract place name
      if (url.includes('/place/')) {
        const placeMatch = url.match(/\/place\/([^/@]+)/);
        if (placeMatch) {
          const place = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
          return `https://maps.google.com/maps?q=${encodeURIComponent(place)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
        }
      }

      // Try to extract query parameter
      if (url.includes('query=')) {
        const queryMatch = url.match(/query=([^&]+)/);
        if (queryMatch) {
          const query = decodeURIComponent(queryMatch[1]);
          return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
        }
      }

      // Try to extract coordinates
      const coordMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (coordMatch) {
        const lat = coordMatch[1];
        const lng = coordMatch[2];
        return `https://maps.google.com/maps?q=${lat},${lng}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
      }

      // Last resort: just try to embed with the place name from URL
      const lastPart = url.split('/').pop()?.split('?')[0] || '';
      if (lastPart) {
        return `https://maps.google.com/maps?q=${encodeURIComponent(lastPart)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
      }

      return '';
    } catch (e) {
      console.error('Error converting maps URL:', e);
      return '';
    }
  };

  // Auto-generate SEO-friendly alt text for property images
  const generateImageAltText = (imageType: 'hero' | 'featured' | 'gallery' | 'floorplan', index?: number): string => {
    const beds = formData.beds || 0;
    const propertyType = formData.property_type?.toLowerCase() || 'property';
    const location = formData.location || 'property';
    const title = formData.title || '';

    switch (imageType) {
      case 'hero':
        return `${beds} bedroom ${propertyType} for sale in ${location} - exterior view`;
      case 'featured':
        const featuredLabels = ['front exterior', 'living area', 'kitchen', 'bedroom'];
        return `${beds} bedroom ${propertyType} in ${location} - ${featuredLabels[index || 0] || `photo ${(index || 0) + 1}`}`;
      case 'gallery':
        return `Interior photo ${(index || 0) + 1} of ${beds} bedroom ${propertyType} in ${location}`;
      case 'floorplan':
        return `Floor plan for ${beds} bedroom ${propertyType} at ${title || location}`;
      default:
        return `${beds} bedroom ${propertyType} in ${location}`;
    }
  };

  // Track changes
  useEffect(() => {
    const hasChanges = JSON.stringify(formData) !== JSON.stringify(property || {});
    setHasUnsavedChanges(hasChanges);
  }, [formData, property]);



  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Auto-generate slug from title
  useEffect(() => {
    if (formData.title && !property?.slug) {
      const slug = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.title, property?.slug]);

  // Auto-generate meta fields if empty
  useEffect(() => {
    if (formData.title && !formData.meta_title) {
      setFormData(prev => ({
        ...prev,
        meta_title: `${formData.title} - Bartlett & Partners`
      }));
    }
    if (formData.description && !formData.meta_description) {
      const desc = formData.description.replace(/<[^>]*>/g, '').substring(0, 155);
      setFormData(prev => ({
        ...prev,
        meta_description: desc
      }));
    }
  }, [formData.title, formData.description]);

  const validateForm = (): boolean => {
    const errors: string[] = [];

    if (!formData.title) errors.push('Title is required');
    if (!formData.price) errors.push('Price is required');
    if (!formData.location) errors.push('Location is required');
    if (!formData.beds) errors.push('Bedrooms is required');
    if (!formData.baths) errors.push('Bathrooms is required');
    if (!formData.hero_image) errors.push('Hero image is required');
    if (!formData.description) errors.push('Full description is required');

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const generateKeywords = (): string[] => {
    const keywords = new Set<string>();

    // Location keywords
    if (formData.location) {
      keywords.add(formData.location.toLowerCase());
      keywords.add(`${formData.location.toLowerCase()} property`);
      keywords.add(`${formData.location.toLowerCase()} estate agents`);
      keywords.add(`houses for sale ${formData.location.toLowerCase()}`);
    }

    // Property type keywords
    if (formData.property_type) {
      keywords.add(formData.property_type.toLowerCase());
      keywords.add(`${formData.beds || 0} bedroom ${formData.property_type.toLowerCase()}`);
    }

    // Area keywords
    keywords.add('south west london property');
    keywords.add('richmond estate agents');
    keywords.add('luxury homes');

    return Array.from(keywords);
  };

  const handleSave = async (isDraft: boolean = false) => {
    if (!isDraft && !validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    try {
      // Auto-generate SEO if empty
      const descriptionText = formData.description ? formData.description.replace(/<[^>]*>/g, '').substring(0, 120) : '';
      const autoSEO = {
        meta_title: formData.meta_title || `${formData.beds || 0} Bed ${formData.property_type || 'Property'} for Sale in ${formData.location || 'London'} | Bartlett & Partners`,
        meta_description: formData.meta_description || `${formData.beds || 0} bedroom ${formData.property_type?.toLowerCase() || 'property'} for sale in ${formData.location || 'London'}. ${descriptionText ? descriptionText + '...' : ''} Price: £${parseInt(formData.price as any || 0)?.toLocaleString()}. Contact Bartlett & Partners.`,
      };

      // Before saving, generate alt texts
      const propertyToSave = {
        ...formData,
        ...autoSEO,
        // Auto-generate keywords if empty
        keywords: (!formData.keywords || formData.keywords.length === 0) ? generateKeywords() : formData.keywords,
        // Auto-generate alt texts
        hero_image_alt: formData.hero_image ? generateImageAltText('hero') : null,
        floor_plan_alt: formData.floor_plan_image ? generateImageAltText('floorplan') : null,
        featured_images_alt: formData.featured_images?.map((img, i) =>
          img ? generateImageAltText('featured', i) : ''
        ) || [],
        gallery_images_alt: formData.gallery_images?.map((img, i) =>
          img ? generateImageAltText('gallery', i) : ''
        ) || [],
      };

      await onSave(propertyToSave, isDraft);
      setHasUnsavedChanges(false);
      toast.success(isDraft ? 'Saved as draft' : 'Property published successfully');
    } catch (error) {
      toast.error('Failed to save property');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    if (!confirm('Are you sure you want to delete this property? This action cannot be undone.')) return;

    try {
      await onDelete();
      toast.success('Property deleted');
    } catch (error) {
      toast.error('Failed to delete property');
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      setShowUnsavedModal(true);
    } else {
      onCancel();
    }
  };

  // Feature management
  const addFeature = () => {
    const features = formData.features || [];
    setFormData({ ...formData, features: [...features, ''] });
  };

  const updateFeature = (index: number, value: string) => {
    const features = [...(formData.features || [])];
    features[index] = value;
    setFormData({ ...formData, features });
  };

  const removeFeature = (index: number) => {
    const features = [...(formData.features || [])];
    features.splice(index, 1);
    setFormData({ ...formData, features });
  };

  const moveFeature = (index: number, direction: 'up' | 'down') => {
    const features = [...(formData.features || [])];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= features.length) return;

    [features[index], features[newIndex]] = [features[newIndex], features[index]];
    setFormData({ ...formData, features });
  };

  // Featured images management
  const updateFeaturedImage = (index: number, url: string) => {
    const featured = [...(formData.featured_images || ['', '', '', ''])];
    featured[index] = url;
    setFormData({ ...formData, featured_images: featured });
  };

  // Gallery management
  const addGalleryImage = (url: string) => {
    const gallery = [...(formData.gallery_images || []), url];
    setFormData({ ...formData, gallery_images: gallery });
  };

  const removeGalleryImage = (index: number) => {
    const gallery = [...(formData.gallery_images || [])];
    gallery.splice(index, 1);
    setFormData({ ...formData, gallery_images: gallery });
  };

  const moveGalleryImage = (index: number, direction: 'up' | 'down') => {
    const gallery = [...(formData.gallery_images || [])];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= gallery.length) return;

    [gallery[index], gallery[newIndex]] = [gallery[newIndex], gallery[index]];
    setFormData({ ...formData, gallery_images: gallery });
  };

  // Drag and drop for gallery images
  const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedImageIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedImageIndex === null || draggedImageIndex === index) return;

    const gallery = [...(formData.gallery_images || [])];
    const draggedItem = gallery[draggedImageIndex];

    // Remove from old position
    gallery.splice(draggedImageIndex, 1);
    // Insert at new position
    gallery.splice(index, 0, draggedItem);

    setFormData({ ...formData, gallery_images: gallery });
    setDraggedImageIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedImageIndex(null);
  };

  // Drag and drop for features
  const [draggedFeatureIndex, setDraggedFeatureIndex] = useState<number | null>(null);

  const handleFeatureDragStart = (index: number) => {
    setDraggedFeatureIndex(index);
  };

  const handleFeatureDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedFeatureIndex === null || draggedFeatureIndex === index) return;

    const features = [...(formData.features || [])];
    const draggedItem = features[draggedFeatureIndex];

    // Remove from old position
    features.splice(draggedFeatureIndex, 1);
    // Insert at new position
    features.splice(index, 0, draggedItem);

    setFormData({ ...formData, features });
    setDraggedFeatureIndex(index);
  };

  const handleFeatureDragEnd = () => {
    setDraggedFeatureIndex(null);
  };

  const sections = [
    { id: 'overview' as Section, label: 'Overview', icon: Home },
    { id: 'location' as Section, label: 'Location', icon: MapPin },
    { id: 'media' as Section, label: 'Media', icon: ImageIcon },
    { id: 'description' as Section, label: 'Description & Features', icon: FileText },
    { id: 'seo' as Section, label: 'SEO', icon: SearchIcon },
  ];

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between bg-white">
        <div className="flex items-center gap-4">
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {property?.id ? 'Edit Property' : 'New Property'}
            </h1>
            {hasUnsavedChanges && (
              <p className="text-sm text-amber-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Unsaved changes
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <div className="w-64 border-r border-gray-200 bg-gray-50 overflow-y-auto">
          <nav className="p-4 space-y-1">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${isActive
                    ? 'bg-[#1A2551] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{section.label}</span>
                  <ChevronRight className={`w-4 h-4 ml-auto ${isActive ? 'opacity-100' : 'opacity-0'}`} />
                </button>
              );
            })}
          </nav>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="p-4 m-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm font-medium text-red-900 mb-2">Required fields:</p>
              <ul className="text-xs text-red-700 space-y-1">
                {validationErrors.map((error, i) => (
                  <li key={i}>• {error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-8">
            {/* Overview Section */}
            {activeSection === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6">Property Overview</h2>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {/* Row 1: Title and Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.title || ''}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. Beautiful Victorian Home in Teddington"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2551] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status || 'available'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2551] focus:border-transparent"
                    >
                      <option value="available">Available</option>
                      <option value="under-offer">Under Offer</option>
                      <option value="sale-agreed">Sale Agreed</option>
                      <option value="sold">Sold</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>

                  {/* Row 2: Price and Property Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">£</span>
                      <input
                        type="number"
                        value={formData.price || ''}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="750000"
                        className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2551] focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Property Type
                    </label>
                    <select
                      value={formData.property_type || ''}
                      onChange={(e) => setFormData({ ...formData, property_type: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2551] focus:border-transparent"
                    >
                      <option value="">Select type...</option>
                      <option value="Detached">Detached</option>
                      <option value="Semi-Detached">Semi-Detached</option>
                      <option value="Terraced">Terraced</option>
                      <option value="End Terrace">End Terrace</option>
                      <option value="Flat">Flat</option>
                      <option value="Apartment">Apartment</option>
                      <option value="Cottage">Cottage</option>
                      <option value="Bungalow">Bungalow</option>
                      <option value="Maisonette">Maisonette</option>
                    </select>
                  </div>

                  {/* Row 3: Bedrooms and Bathrooms */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bedrooms <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.beds || ''}
                      onChange={(e) => setFormData({ ...formData, beds: parseInt(e.target.value) || 0 })}
                      placeholder="3"
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2551] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bathrooms <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.baths || ''}
                      onChange={(e) => setFormData({ ...formData, baths: parseInt(e.target.value) || 0 })}
                      placeholder="2"
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2551] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Location Section */}
            {activeSection === 'location' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Location</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Area/Town Text Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Area / Town <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.location || ''}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g. Richmond, Kew, Teddington"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2551] focus:border-transparent"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Used for filtering properties</p>
                  </div>

                  {/* Google Maps URL - Simple paste field */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Google Maps URL
                    </label>
                    <input
                      type="url"
                      value={formData.google_maps_url || ''}
                      onChange={(e) => setFormData({ ...formData, google_maps_url: e.target.value })}
                      placeholder="https://www.google.com/maps/place/..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2551] focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Paste the Google Maps link for this property. Go to Google Maps, find the location, click Share → Copy link.
                    </p>
                  </div>

                  {/* Map Preview */}
                  {formData.google_maps_url && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Map Preview
                      </label>
                      <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                        <iframe
                          src={convertToEmbedUrl(formData.google_maps_url)}
                          width="100%"
                          height="250"
                          style={{ border: 0 }}
                          allowFullScreen
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          title="Map preview"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Media Section */}
            {activeSection === 'media' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6">Media & Images</h2>
                </div>

                {/* Hero Image */}


                {/* Primary Media Grid (Hero & Floorplan) */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Primary Images</h3>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <CMSImageUpload
                        label="Hero Image"
                        value={formData.hero_image || ''}
                        onChange={(url) => setFormData({ ...formData, hero_image: url })}
                        variant="card"
                      />
                    </div>
                    <div>
                      <CMSImageUpload
                        label="Floor Plan"
                        value={formData.floor_plan_image || ''}
                        onChange={(url) => setFormData({ ...formData, floor_plan_image: url })}
                        variant="card"
                      />
                    </div>
                  </div>
                </div>

                {/* Gallery Images */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Gallery Images</h3>
                      <p className="text-xs text-gray-500">
                        The <span className="font-semibold text-[#8E8567]">first 4 images</span> will be shown as featured images
                      </p>
                    </div>
                    <CMSMultiImageUpload
                      variant="button"
                      label="Add Images"
                      onImagesUploaded={(urls) => {
                        const gallery = [...(formData.gallery_images || []), ...urls];
                        setFormData({ ...formData, gallery_images: gallery });
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    {(formData.gallery_images || []).map((image, index) => (
                      <div
                        key={index}
                        className={`group relative aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden border-2 transition-all cursor-grab active:cursor-grabbing ${draggedImageIndex === index
                          ? 'border-[#1A2551] ring-2 ring-[#1A2551]/20 opacity-50'
                          : 'border-transparent hover:border-gray-300'
                          }`}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnd={handleDragEnd}
                      >
                        {/* Image */}
                        <img
                          src={image}
                          alt={
                            (formData.gallery_images_alt as any)?.[index] ||
                            `Property image ${index + 1}`
                          }
                          className="w-full h-full object-cover"
                        />

                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                        {/* Drag Handle Icon (Visual only) */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 p-1.5 rounded-full shadow-sm cursor-grab">
                          <GripVertical className="w-4 h-4 text-gray-600" />
                        </div>

                        {/* Featured Badge */}
                        {index < 4 && (
                          <div className="absolute top-2 left-2 bg-[#8E8567] text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1">
                            <Star className="w-3 h-3 fill-current" />
                            FEATURED
                          </div>
                        )}

                        {/* Bottom Bar */}
                        <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between">
                          <span className="text-xs text-white font-medium truncat dropshadow-md">
                            {index + 1}. {image.split('/').pop()?.slice(0, 15)}...
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeGalleryImage(index);
                            }}
                            className="p-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors shadow-sm"
                            title="Remove image"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Floorplan */}


                {/* Video URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Video URL
                  </label>
                  <input
                    type="url"
                    value={formData.video_url || ''}
                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                    placeholder="https://vimeo.com/... or https://youtube.com/..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2551] focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Vimeo or YouTube link</p>
                </div>
              </div>
            )}

            {/* Description & Features Section */}
            {activeSection === 'description' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6">Description & Features</h2>
                </div>

                {/* Description Editor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <div className="rich-text-editor">
                    <ReactQuill
                      theme="snow"
                      value={formData.description || ''}
                      onChange={(value) => setFormData({ ...formData, description: value })}
                      modules={{
                        toolbar: [
                          [{ 'header': [2, 3, false] }],
                          ['bold', 'italic', 'underline'],
                          [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                          ['link'],
                          ['clean']
                        ],
                      }}
                      formats={[
                        'header',
                        'bold', 'italic', 'underline',
                        'list', 'bullet',
                        'link'
                      ]}
                      className="bg-white"
                      style={{ minHeight: '300px' }}
                    />
                  </div>
                </div>

                {/* Features List */}
                <div className="border-t border-gray-200 pt-8">
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Property Features</h3>
                    <p className="text-sm text-gray-500">Add key features and amenities. Drag to reorder.</p>
                  </div>

                  <div className="space-y-3">
                    {(formData.features || []).map((feature, index) => (
                      <div
                        key={index}
                        className={`flex items-center gap-3 bg-gray-50 p-3 rounded-lg border-2 transition-colors ${draggedFeatureIndex === index
                          ? 'border-[#1A2551] bg-blue-50'
                          : 'border-transparent hover:border-gray-200'
                          }`}
                        draggable
                        onDragStart={() => handleFeatureDragStart(index)}
                        onDragOver={(e) => handleFeatureDragOver(e, index)}
                        onDragEnd={handleFeatureDragEnd}
                      >
                        <button
                          type="button"
                          className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
                        >
                          <GripVertical className="w-5 h-5" />
                        </button>
                        <input
                          type="text"
                          value={feature}
                          onChange={(e) => updateFeature(index, e.target.value)}
                          placeholder="e.g. Period features throughout"
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2551] focus:border-transparent"
                        />
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => moveFeature(index, 'up')}
                            disabled={index === 0}
                            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30 hover:bg-white rounded transition-colors"
                            title="Move up"
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            onClick={() => moveFeature(index, 'down')}
                            disabled={index === (formData.features?.length || 0) - 1}
                            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30 hover:bg-white rounded transition-colors"
                            title="Move down"
                          >
                            ↓
                          </button>
                          <button
                            type="button"
                            onClick={() => removeFeature(index)}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Remove feature"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={addFeature}
                    className="w-full mt-4 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#1A2551] hover:text-[#1A2551] transition-colors"
                  >
                    + Add Feature
                  </button>
                </div>
              </div>
            )}

            {/* SEO Section */}
            {activeSection === 'seo' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6">SEO & Meta Data</h2>
                </div>

                {/* URL Slug */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={formData.slug || ''}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                    placeholder="property-url-slug"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2551] focus:border-transparent font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    URL: /{parentSlug}/{formData.slug || 'property-slug'}
                  </p>
                </div>

                {/* Canonical URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Canonical URL
                  </label>
                  <input
                    type="text"
                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}/${parentSlug}/${formData.slug || 'property-slug'}`}
                    readOnly
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Title
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={60}
                      value={formData.meta_title || ''}
                      onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                      placeholder="Auto-generated from title"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2551] focus:border-transparent"
                    />
                    <CharacterCounter
                      current={formData.meta_title?.length || 0}
                      optimal={55}
                      max={60}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Description
                  </label>
                  <div className="relative">
                    <textarea
                      rows={3}
                      maxLength={155}
                      value={formData.meta_description || ''}
                      onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                      placeholder="Auto-generated from description"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2551] focus:border-transparent resize-none"
                    />
                    <CharacterCounter
                      current={formData.meta_description?.length || 0}
                      optimal={145}
                      max={155}
                      className="absolute right-3 bottom-2"
                    />
                  </div>
                </div>

                {/* Keywords */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Keywords
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    Press Enter or comma to add a keyword. These are auto-generated but you can customize them.
                  </p>
                  <div className="flex flex-wrap gap-2 p-2 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-[#1A2551] focus-within:border-transparent bg-white min-h-[42px]">
                    {(formData.keywords || []).map((keyword, index) => (
                      <span key={index} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {keyword}
                        <button
                          type="button"
                          onClick={() => {
                            const newKeywords = [...(formData.keywords || [])];
                            newKeywords.splice(index, 1);
                            setFormData({ ...formData, keywords: newKeywords });
                          }}
                          className="hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      className="flex-1 min-w-[120px] outline-none text-sm py-1 bg-transparent"
                      placeholder="Add keyword..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ',') {
                          e.preventDefault();
                          const val = e.currentTarget.value.trim();
                          if (val) {
                            const current = formData.keywords || [];
                            if (!current.includes(val)) {
                              setFormData({ ...formData, keywords: [...current, val] });
                            }
                            e.currentTarget.value = '';
                          }
                        } else if (e.key === 'Backspace' && !e.currentTarget.value && (formData.keywords || []).length > 0) {
                          const newKeywords = [...(formData.keywords || [])];
                          newKeywords.pop();
                          setFormData({ ...formData, keywords: newKeywords });
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Search Engine Settings */}
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-4">Search Engine Settings</h4>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.noindex !== true}
                        onChange={(e) => setFormData({ ...formData, noindex: !e.target.checked })}
                        className="w-4 h-4 text-[#1A2551] rounded border-gray-300 focus:ring-[#1A2551]"
                      />
                      <span className="text-sm text-gray-700">Allow search engines to index this page</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.nofollow !== true}
                        onChange={(e) => setFormData({ ...formData, nofollow: !e.target.checked })}
                        className="w-4 h-4 text-[#1A2551] rounded border-gray-300 focus:ring-[#1A2551]"
                      />
                      <span className="text-sm text-gray-700">Allow search engines to follow links</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.sitemap_enabled !== false}
                        onChange={(e) => setFormData({ ...formData, sitemap_enabled: e.target.checked })}
                        className="w-4 h-4 text-[#1A2551] rounded border-gray-300 focus:ring-[#1A2551]"
                      />
                      <span className="text-sm text-gray-700">Include in XML sitemap</span>
                    </label>
                  </div>
                </div>

                {/* Google Search Preview */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Google Search Preview
                  </label>
                  <div className="border border-gray-200 rounded-lg p-4 bg-white">
                    <div className="space-y-1">
                      <div className="text-sm text-gray-600">
                        {typeof window !== 'undefined' ? window.location.host : 'bartlettandpartners.co.uk'} › properties › {formData.slug || 'property-slug'}
                      </div>
                      <div className="text-xl text-blue-600 hover:underline cursor-pointer">
                        {formData.meta_title || formData.title || 'Property Title'}
                      </div>
                      <div className="text-sm text-gray-600 line-clamp-2">
                        {formData.meta_description || (formData.description ? formData.description.replace(/<[^>]*>/g, '').substring(0, 155) : '') || 'Property description will appear here in search results.'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="border-t border-gray-200 bg-white px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            {property?.id && onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Property
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleSave(true)}
              disabled={isSaving}
              className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
            >
              Save Draft
            </button>
            <button
              type="button"
              onClick={() => handleSave(false)}
              disabled={isSaving}
              className="px-6 py-2.5 bg-[#1A2551] text-white rounded-lg hover:bg-[#1A2551]/90 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving ? (
                <>Saving...</>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Publish Property
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Unsaved Changes Modal */}
      {showUnsavedModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Unsaved Changes</h3>
            </div>
            <p className="text-gray-600 mb-6">
              You have unsaved changes that will be lost if you leave this page. Would you like to save your work first?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowUnsavedModal(false);
                  onCancel();
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
              >
                Discard Changes
              </button>
              <button
                onClick={() => setShowUnsavedModal(false)}
                className="px-4 py-2 bg-[#1A2551] text-white rounded-lg hover:bg-[#1A2551]/90 transition-colors font-medium"
              >
                Keep Editing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}