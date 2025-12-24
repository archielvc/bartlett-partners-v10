import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, MapPin, Bed, Bath, ArrowUp, ArrowDown, Code } from 'lucide-react';
import { toast } from 'sonner';
import { CMSPageLayout } from '../CMSPageLayout';
import { JSONImportModal } from '../JSONImportModal';
import { PropertyEditor } from '../PropertyEditor';
import { getAllPropertiesAdmin, createProperty, updateProperty, deleteProperty, updatePropertyOrder } from '../../../utils/database';
import { generatePropertySEO } from '../../../utils/autoSEO';
import type { Property } from '../../../types/database';
import { Checkbox } from '../../ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../ui/alert-dialog';

export function CMSProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showJSONImport, setShowJSONImport] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Partial<Property> | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  // Selection & Deletion State
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    type: 'single' | 'bulk';
    id?: number;
  }>({ isOpen: false, type: 'single' });

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    setIsLoading(true);
    try {
      // Use full data query so editing is instant (no extra DB call needed)
      const data = await getAllPropertiesAdmin();
      setProperties(data);
      setSelectedIds([]); // Clear selection on reload
    } catch (error) {
      console.error('Failed to load properties', error);
      toast.error('Failed to load properties');
    } finally {
      setIsLoading(false);
    }
  };

  // Selection Handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(properties.map(p => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelect = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(item => item !== id));
    }
  };

  const handleEdit = (property: Property) => {
    // Use the property data directly - already loaded from the list
    // Note: If the light query is missing fields, they'll be undefined but won't break the editor
    setEditingProperty(property);
    setShowEditor(true);
  };

  const handleCreate = () => {
    setEditingProperty({
      status: 'draft',
      beds: 0,
      baths: 0,
      sqft: 0,
      price: '0',
      gallery_images: [],
      featured_images: ['', '', '', ''],
      features: []
    });
    setShowEditor(true);
  };

  const handleSave = async (data: Partial<Property>, isDraft: boolean) => {
    try {
      // Auto-generate slug if missing and sanitize
      let finalSlug = data.slug?.trim() || data.title?.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `property-${Date.now()}`;
      finalSlug = finalSlug.replace(/\s+/g, '-').toLowerCase();

      // When saving as draft, force status to 'draft'
      // When publishing, use the status from the form (user's selection)
      const finalStatus = isDraft ? 'draft' : data.status;

      const dataToSave = { ...data, slug: finalSlug, status: finalStatus };

      if (editingProperty?.id) {
        await updateProperty(editingProperty.id, dataToSave);
      } else {
        await createProperty(dataToSave);
      }

      await loadProperties();
      setShowEditor(false);
      setEditingProperty(null);
    } catch (error) {
      console.error('Failed to save property', error);
      throw error;
    }
  };

  const confirmDelete = async () => {
    try {
      if (deleteConfirm.type === 'single' && deleteConfirm.id) {
        await deleteProperty(deleteConfirm.id);
        toast.success('Property deleted');
      } else if (deleteConfirm.type === 'bulk') {
        let deletedCount = 0;
        for (const id of selectedIds) {
          try {
            await deleteProperty(id);
            deletedCount++;
          } catch (e) {
            console.error(`Failed to delete property ${id}`, e);
          }
        }
        toast.success(`${deletedCount} properties deleted`);
      }

      await loadProperties();
      setDeleteConfirm({ isOpen: false, type: 'single' });
    } catch (error) {
      console.error('Failed to delete', error);
      toast.error('Failed to delete property');
    }
  };

  const handleDeleteClick = (id: number) => {
    setDeleteConfirm({ isOpen: true, type: 'single', id });
  };

  const handleBulkDeleteClick = () => {
    setDeleteConfirm({ isOpen: true, type: 'bulk' });
  };

  // Replaced original handleDelete with this flow
  const handleDelete = async (id?: number) => {
    // This function is kept for compatibility with Editor but redirecting logic
    if (id) handleDeleteClick(id);
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;

    if (newIndex < 0 || newIndex >= properties.length) return;

    const currentProp = properties[index];
    const targetProp = properties[newIndex];

    // Status Group Logic
    const getGroup = (s: string) => {
      s = s?.toLowerCase() || '';
      if (s === 'available') return 0;
      if (s === 'under_offer' || s === 'under-offer') return 1;
      if (s === 'sold') return 2;
      return 3;
    };

    if (getGroup(currentProp.status) !== getGroup(targetProp.status)) {
      toast.error("Cannot reorder across different status groups (Available > Under Offer > Sold)");
      return;
    }

    // Optimistic Update
    const newProperties = [...properties];
    newProperties[index] = targetProp;
    newProperties[newIndex] = currentProp;

    setProperties(newProperties);

    // Save Order
    const orderedIds = newProperties.map(p => p.id);
    try {
      await updatePropertyOrder(orderedIds);
    } catch (e) {
      console.error('Failed to save order', e);
      toast.error("Failed to save order");
      loadProperties(); // Revert
    }
  };


  const handleJSONImport = async (data: any[]) => {
    let imported = 0;
    let skipped = 0;
    let errors = 0;

    for (const item of data) {
      try {
        // Validate required fields
        if (!item.title?.trim()) {
          console.warn(`⚠️ Skipping item with missing title:`, item);
          errors++;
          continue;
        }

        // Generate slug if not present
        const slug = item.slug || item.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `property-${Date.now()}`;

        // Check if property with this slug already exists
        const existing = properties.find(p => p.slug === slug);
        if (existing) {
          console.log(`Skipping existing property: ${item.title}`);
          skipped++;
          continue;
        }

        // Parse features if needed (support semicolon-separated string or array)
        let features: string[] = [];
        if (item.features) {
          if (typeof item.features === 'string') {
            features = item.features.split(';').map((f: string) => f.trim()).filter(Boolean);
          } else if (Array.isArray(item.features)) {
            features = item.features;
          }
        }

        // Parse nearby_places if it's a string
        let nearbyPlaces: any[] = [];
        if (item.nearby_places) {
          if (typeof item.nearby_places === 'string') {
            try {
              nearbyPlaces = JSON.parse(item.nearby_places);
            } catch {
              nearbyPlaces = [];
            }
          } else if (Array.isArray(item.nearby_places)) {
            nearbyPlaces = item.nearby_places;
          }
        }

        // Parse keywords if needed
        let keywords: string[] | null = null;
        if (item.keywords) {
          if (typeof item.keywords === 'string') {
            keywords = item.keywords.split(',').map((k: string) => k.trim()).filter(Boolean);
          } else if (Array.isArray(item.keywords)) {
            keywords = item.keywords;
          }
        }

        // Build comprehensive property data (ALL fields except images)
        const propertyData: Partial<Property> = {
          // === OVERVIEW ===
          title: item.title.trim(),
          slug: slug,
          short_description: item.short_description?.trim() || null,
          price: String(item.price || 0),
          status: item.status || 'draft', // Default to draft for safety
          property_type: item.property_type || 'Property',
          beds: Number(item.beds || 0),
          baths: Number(item.baths || 0),
          receptions: item.receptions != null ? Number(item.receptions) : null,
          sqft: Number(item.sqft || 0),
          epc_rating: item.epc_rating || null,
          council_tax_band: item.council_tax_band || null,

          // === LOCATION ===
          location: item.location || 'Kew',
          area: item.area || item.location || null,
          postcode: item.postcode || null,
          full_address: item.full_address || null,
          google_maps_url: item.google_maps_url || null,

          // === MEDIA (URLs only - images must be uploaded directly) ===
          // NOTE: Image fields are intentionally excluded as they need to be uploaded directly
          // hero_image, gallery_images, featured_images, floor_plan_image - NOT IMPORTED
          virtual_tour_url: item.virtual_tour_url || null,
          video_url: item.video_url || null,

          // === CONTENT ===
          description: item.description || null,
          features: features,
          nearby_places: nearbyPlaces,

          // === SEO ===
          meta_title: item.meta_title || null,
          meta_description: item.meta_description || null,
          keywords: keywords,
          noindex: item.noindex ?? false,
          nofollow: item.nofollow ?? false,
          sitemap_enabled: item.sitemap_enabled ?? true,
        };

        // Auto-generate SEO if not provided
        if (!propertyData.meta_title || !propertyData.meta_description) {
          const autoSEO = generatePropertySEO(propertyData as Property);
          if (!propertyData.meta_title) propertyData.meta_title = autoSEO.title;
          if (!propertyData.meta_description) propertyData.meta_description = autoSEO.description;
          if (!propertyData.keywords) propertyData.keywords = autoSEO.keywords;
        }

        console.log(`📝 Importing property:`, {
          title: propertyData.title,
          slug: propertyData.slug,
          status: propertyData.status,
          location: propertyData.location,
          beds: propertyData.beds,
          price: propertyData.price
        });

        await createProperty(propertyData);
        imported++;
        console.log(`✅ Successfully imported: ${item.title}`);
      } catch (e) {
        errors++;
        console.error(`❌ Failed to import property: ${item.title}`, e);
      }
    }

    await loadProperties();

    // Show appropriate toast message
    if (errors > 0) {
      toast.error(`Imported ${imported}, failed ${errors}, skipped ${skipped} duplicates`);
    } else if (skipped > 0) {
      toast.info(`Imported ${imported}, skipped ${skipped} duplicates`);
    } else {
      toast.success(`Successfully imported ${imported} properties`);
    }
  };

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      maximumFractionDigits: 0,
    }).format(numPrice);
  };

  if (showEditor) {
    return (
      <PropertyEditor
        property={editingProperty}
        onSave={handleSave}
        onDelete={editingProperty?.id ? async () => handleDeleteClick(editingProperty.id!) : undefined}
        onCancel={() => {
          setShowEditor(false);
          setEditingProperty(null);
        }}
      />
    );
  }

  const actions = [
    { label: 'Import JSON', icon: Code, onClick: () => setShowJSONImport(true), variant: 'outline' as const },
    { label: 'Add Property', icon: Plus, onClick: handleCreate },
  ];

  if (selectedIds.length > 0) {
    actions.unshift({
      label: `Delete Selected (${selectedIds.length})`,
      icon: Trash2,
      onClick: handleBulkDeleteClick,
      variant: 'outline' as const // Using outline but maybe styled destructively in UI if supported, or handled via class
    });
  }

  const filteredProperties = properties.filter(property => {
    const term = searchTerm.toLowerCase();
    return (
      property.title?.toLowerCase().includes(term) ||
      property.location?.toLowerCase().includes(term) ||
      property.status?.toLowerCase().includes(term) ||
      property.slug?.toLowerCase().includes(term) ||
      property.price?.toString().includes(term)
    );
  });

  return (
    <CMSPageLayout
      title="Properties"
      description="Manage your exclusive portfolio"
      actions={actions}
    >
      <AlertDialog open={deleteConfirm.isOpen} onOpenChange={(open) => setDeleteConfirm(prev => ({ ...prev, isOpen: open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteConfirm.type === 'bulk'
                ? `This will permanently delete ${selectedIds.length} selected properties. This action cannot be undone.`
                : "This action cannot be undone. This will permanently delete the property."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-700 hover:bg-red-800">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <JSONImportModal
        isOpen={showJSONImport}
        onClose={() => setShowJSONImport(false)}
        onImport={handleJSONImport}
        type="properties"
      />

      {/* Search Bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search properties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1A2551] focus:border-transparent text-sm"
          />
        </div>
      </div>

      {/* Properties Grid */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="w-10 px-6 py-3">
                <Checkbox
                  checked={selectedIds.length === properties.length && properties.length > 0}
                  onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                />
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Property</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Location</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Price</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Details</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
              <th className="text-right px-6 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  Loading properties...
                </td>
              </tr>
            ) : filteredProperties.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  {searchTerm ? 'No properties found matching your search.' : 'No properties found. Add your first property to get started.'}
                </td>
              </tr>
            ) : (
              filteredProperties.map((property, index) => (
                <tr key={property.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <Checkbox
                      checked={selectedIds.includes(property.id)}
                      onCheckedChange={(checked) => handleSelect(property.id, checked as boolean)}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {property.hero_image ? (
                          <img
                            src={property.hero_image}
                            alt={property.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <MapPin className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 line-clamp-1">{property.title}</div>
                        <div className="text-xs text-gray-500">/{property.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      {property.location}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">
                      {formatPrice(property.price)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Bed className="w-4 h-4" />
                        {property.beds}
                      </div>
                      <div className="flex items-center gap-1">
                        <Bath className="w-4 h-4" />
                        {property.baths}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${property.status === 'available'
                      ? 'bg-emerald-100 text-emerald-700'
                      : property.status === 'sold'
                        ? 'bg-gray-100 text-gray-700'
                        : property.status === 'under-offer'
                          ? 'bg-amber-100 text-amber-700'
                          : property.status === 'sale-agreed'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-yellow-100 text-yellow-700'
                      }`}>
                      {property.status === 'available' ? 'Available' :
                        property.status === 'under-offer' ? 'Under Offer' :
                          property.status === 'sale-agreed' ? 'Sale Agreed' :
                            property.status === 'sold' ? 'Sold' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <div className="flex items-center mr-2 bg-gray-50 rounded-lg p-1">
                        <button
                          onClick={() => handleMove(index, 'up')}
                          disabled={index === 0}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:hover:text-gray-400"
                          title="Move Up"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleMove(index, 'down')}
                          disabled={index === properties.length - 1}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:hover:text-gray-400"
                          title="Move Down"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                      </div>

                      <button
                        onClick={() => handleEdit(property)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                        title="Edit Property"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(property.id)}
                        className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                        title="Delete Property"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </CMSPageLayout>
  );
}
