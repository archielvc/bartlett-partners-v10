import { useState, useEffect, ReactNode } from 'react';
import { Plus, Edit, Trash2, Search, MapPin, Bed, Bath, ArrowUp, ArrowDown, Code, ChevronDown, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { CMSPageLayout } from '../CMSPageLayout';
import { JSONImportModal } from '../JSONImportModal';
import { PropertyEditor } from '../PropertyEditor';
import { getAllPropertiesAdmin, createProperty, updateProperty, deleteProperty, updatePropertyOrder } from '../../../utils/database';
import { get, set } from '../../../utils/kvStore';
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
import { useAuth } from '../../../contexts/AuthContext';

export function CMSProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showJSONImport, setShowJSONImport] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Partial<Property> | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  // Collapsible sections state
  // Default drafts to open (true) or closed? User request "make it collapsible". 
  // Often minimizing noise means defaulting to closed if there are many, but open is safer.
  const [isDraftsOpen, setIsDraftsOpen] = useState(true);

  // Selection & Deletion State
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    type: 'single' | 'bulk';
    id?: number;
  }>({ isOpen: false, type: 'single' });

  // Featured Settings State
  const [homeHeroId, setHomeHeroId] = useState<number | null>(null);
  const [homeFeaturedIds, setHomeFeaturedIds] = useState<number[]>([]);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const [heroId, featuredIds] = await Promise.all([
        get<number>('home_hero_id'),
        get<number[]>('home_featured_ids')
      ]);
      setHomeHeroId(heroId);
      setHomeFeaturedIds(featuredIds || []);
    } catch (error) {
      console.error('Failed to load settings', error);
    }
  };

  const handleSetHero = async (id: number) => {
    try {
      // If clicking already selected, maybe deselect? Or just enforce one? Let's assume enforce new one.
      // If clicking same, toggle off?
      const newValue = homeHeroId === id ? null : id;
      setHomeHeroId(newValue);
      await set('home_hero_id', newValue);
      toast.success(newValue ? 'Hero property updated' : 'Hero property removed');
    } catch (error) {
      toast.error('Failed to update hero property');
    }
  };

  const handleToggleFeatured = async (id: number) => {
    try {
      let newIds: number[];
      if (homeFeaturedIds.includes(id)) {
        newIds = homeFeaturedIds.filter(fid => fid !== id);
      } else {
        if (homeFeaturedIds.length >= 3) {
          toast.error("Maximum 3 properties can be featured on Home Page");
          return;
        }
        newIds = [...homeFeaturedIds, id];
      }
      setHomeFeaturedIds(newIds);
      await set('home_featured_ids', newIds);
      toast.success('Home featured properties updated');
    } catch (error) {
      toast.error('Failed to update home featured properties');
    }
  };

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadProperties();
  }, []);

  // Helper to determine sort weight
  const getPropertyWeight = (p: Property) => {
    const s = p.status?.toLowerCase() || '';
    if (s === 'draft') return 0;

    // Published properties
    if (s === 'available') return p.is_featured ? 1 : 2;
    // sale-agreed includes under-offer logically for ordering
    if (s === 'sale-agreed' || s === 'under-offer' || s === 'under_offer') return 3;
    if (s === 'sold') return 4;

    return 5; // Any other status
  };

  const loadProperties = async () => {
    setIsLoading(true);
    try {
      // Use full data query - already sorted by database custom order
      const data = await getAllPropertiesAdmin();
      setProperties(data as Property[]);
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

      let success = false;
      if (editingProperty?.id) {
        success = await updateProperty(editingProperty.id, dataToSave);
      } else {
        const newProperty = await createProperty(dataToSave);
        success = !!newProperty;
      }

      if (!success) {
        throw new Error('Database operation failed');
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
    if (id) handleDeleteClick(id);
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;

    if (newIndex < 0 || newIndex >= properties.length) return;

    const currentProp = properties[index];
    const targetProp = properties[newIndex];

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

        // Build comprehensive property data
        const propertyData: Partial<Property> = {
          title: item.title.trim(),
          slug: slug,
          short_description: item.short_description?.trim() || null,
          price: String(item.price || 0),
          status: item.status || 'draft',
          property_type: item.property_type || 'Property',
          beds: Number(item.beds || 0),
          baths: Number(item.baths || 0),
          receptions: item.receptions != null ? Number(item.receptions) : null,
          sqft: Number(item.sqft || 0),
          epc_rating: item.epc_rating || null,
          council_tax_band: item.council_tax_band || null,
          location: item.location || 'Kew',
          area: item.area || item.location || null,
          postcode: item.postcode || null,
          full_address: item.full_address || null,
          google_maps_url: item.google_maps_url || null,
          virtual_tour_url: item.virtual_tour_url || null,
          video_url: item.video_url || null,
          description: item.description || null,
          features: features,
          nearby_places: nearbyPlaces,
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

  const { isAdmin } = useAuth();

  const actions = [
    ...(isAdmin ? [{ label: 'Import JSON', icon: Code, onClick: () => setShowJSONImport(true), variant: 'outline' as const }] : []),
    { label: 'Add Property', icon: Plus, onClick: handleCreate },
  ];

  if (selectedIds.length > 0) {
    actions.unshift({
      label: `Delete Selected (${selectedIds.length})`,
      icon: Trash2,
      onClick: handleBulkDeleteClick,
      variant: 'outline' as const
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

  // Split into Drafts and Published
  const draftProperties = filteredProperties.filter(p => p.status === 'draft');
  const publishedProperties = filteredProperties.filter(p => ['available', 'sale-agreed', 'sold'].includes(p.status?.toLowerCase()));

  interface PropertyTableProps {
    items: Property[];
    title?: string | ReactNode;
    emptyMessage: string;
    isCollapsible?: boolean;
    isOpen?: boolean;
    onToggle?: () => void;
    stats?: ReactNode;
  }

  const PropertyTable = ({ items, title, emptyMessage, isCollapsible, isOpen, onToggle, stats }: PropertyTableProps) => {
    // If collapsible and closed, just show header

    return (
      <div className="mb-10 last:mb-0">
        {title && (
          <div
            className={`flex items-center gap-3 mb-4 pl-1 ${isCollapsible ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
            onClick={isCollapsible ? onToggle : undefined}
          >
            <div className="h-6 w-1 bg-[#1A2551] rounded-full"></div>
            <h2 className="text-xl font-semibold text-[#1A2551] select-none">{title}</h2>
            <span className="bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full text-xs font-medium border border-gray-200">{items.length} Total</span>
            {stats}
            {isCollapsible && (
              <div className="ml-2 text-gray-400">
                {isOpen ? <ChevronDown className="w-5 h-5 transition-transform" /> : <ChevronRight className="w-5 h-5 transition-transform" />}
              </div>
            )}
          </div>
        )}

        {(isOpen || !isCollapsible) && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="w-10 px-6 py-3">
                    <Checkbox
                      checked={items.length > 0 && items.every(p => selectedIds.includes(p.id))}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          const newIds = items.map(p => p.id).filter(id => !selectedIds.includes(id));
                          setSelectedIds(prev => [...prev, ...newIds]);
                        } else {
                          const idsToRemove = items.map(p => p.id);
                          setSelectedIds(prev => prev.filter(id => !idsToRemove.includes(id)));
                        }
                      }}
                    />
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Property</th>
                  <th className="text-center px-6 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Featured</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Location</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Price</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Details</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      {emptyMessage}
                    </td>
                  </tr>
                ) : (
                  items.map((property) => {
                    const globalIndex = properties.findIndex(p => p.id === property.id);
                    const isFirst = globalIndex === 0;
                    const isLast = globalIndex === properties.length - 1;

                    return (
                      <tr key={property.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <Checkbox
                            checked={selectedIds.includes(property.id)}
                            onCheckedChange={(checked) => handleSelect(property.id, checked as boolean)}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
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
                              {/* Status Indicators */}
                              {property.id === homeHeroId && (
                                <div className="absolute top-0 left-0 p-1">
                                  <div className="bg-[#1A2551] rounded-full p-1 shadow-sm border border-white/20" title="Hero Property">
                                    <ArrowUp className="w-2.5 h-2.5 text-white" />
                                  </div>
                                </div>
                              )}
                              {homeFeaturedIds.includes(property.id) && (
                                <div className="absolute top-0 right-0 p-1">
                                  <div className="bg-[#8E8567] rounded-full p-1 shadow-sm border border-white/20" title="Home Featured">
                                    <Plus className="w-2.5 h-2.5 text-white" />
                                  </div>
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 line-clamp-1">{property.title}</div>
                              <div className="text-xs text-gray-500">/{property.slug}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleSetHero(property.id)}
                              className={`p-1.5 rounded-full transition-colors ${homeHeroId === property.id
                                ? 'bg-[#1A2551] text-white'
                                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                }`}
                              title="Set as Hero Property"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill={homeHeroId === property.id ? "currentColor" : "none"} />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleToggleFeatured(property.id)}
                              className={`p-1.5 rounded-full transition-colors ${homeFeaturedIds.includes(property.id)
                                ? 'bg-[#8E8567] text-white'
                                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                }`}
                              title="Toggle Home Feature"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m19 6-11 11-5-5" />
                              </svg>
                            </button>
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
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${property.status === 'available'
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
                            {!searchTerm && (
                              <div className="flex items-center mr-2 bg-gray-50 rounded-lg p-1">
                                <button
                                  onClick={() => handleMove(globalIndex, 'up')}
                                  disabled={isFirst}
                                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:hover:text-gray-400"
                                  title="Move Up"
                                >
                                  <ArrowUp className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleMove(globalIndex, 'down')}
                                  disabled={isLast}
                                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:hover:text-gray-400"
                                  title="Move Down"
                                >
                                  <ArrowDown className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                            <button
                              onClick={() => handleEdit(property)}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                              title="Edit Property"
                            // Stop propagation so clicking row controls doesn't toggle collapse if we had row click
                            // But we don't have row click, so fine.
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
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

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
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white">Delete</AlertDialogAction>
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

      {isLoading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
          Loading properties...
        </div>
      ) : (
        <>
          {/* If search is active, show flat list. If not, show grouped. */}
          {searchTerm ? (
            <PropertyTable
              items={filteredProperties}
              title="Search Results"
              emptyMessage="No properties found matching your search."
            />
          ) : (
            <>
              {/* Drafts Section - Always top if exists, now collapsible */}
              {(draftProperties.length > 0 || publishedProperties.length === 0) && (
                <PropertyTable
                  items={draftProperties}
                  title="Draft Properties"
                  emptyMessage="No draft properties."
                  isCollapsible={true}
                  isOpen={isDraftsOpen}
                  onToggle={() => setIsDraftsOpen(!isDraftsOpen)}
                />
              )}

              {/* Published Section - Not collapsible by default unless requested */}
              {publishedProperties.length > 0 && (
                <PropertyTable
                  items={publishedProperties}
                  title="Published Properties"
                  stats={
                    <div className="flex items-center gap-2">
                      <span className="bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full text-xs font-medium border border-emerald-200">
                        {publishedProperties.filter(p => p.status?.toLowerCase() === 'available').length} Available
                      </span>
                      <span className="bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full text-xs font-medium border border-blue-200">
                        {publishedProperties.filter(p => ['sale-agreed', 'sale agreed'].includes(p.status?.toLowerCase())).length} Sale Agreed
                      </span>
                      <span className="bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full text-xs font-medium border border-gray-200">
                        {publishedProperties.filter(p => p.status?.toLowerCase() === 'sold').length} Sold
                      </span>
                    </div>
                  }
                  emptyMessage="No published properties."
                />
              )}
            </>
          )}
        </>
      )}
    </CMSPageLayout>
  );
}
