import { useState } from 'react';
import { Upload, Search, Edit, Trash2, Folder, X, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { ImageWithFallback } from '../ui/ImageWithFallback';
import { CMSPageLayout } from './CMSPageLayout';
import { Button } from '../ui/button';

interface MediaItem {
  id: number;
  name: string;
  url: string;
  alt: string;
  folder: 'Properties' | 'Blog' | 'Global';
  linkedTo?: string; // e.g., "Luxury Richmond Townhouse" or "Market Insights 2025"
  size: string;
}

export function MediaLibrary() {
  const [selectedImage, setSelectedImage] = useState<MediaItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [folderFilter, setFolderFilter] = useState<string>('All');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  const mediaItems: MediaItem[] = [
    {
      id: 1,
      name: 'townhouse-exterior.jpg',
      url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400',
      alt: 'Luxury townhouse exterior',
      folder: 'Properties',
      linkedTo: 'Luxury Richmond Townhouse',
      size: '2.4 MB'
    },
    {
      id: 2,
      name: 'townhouse-interior-living.jpg',
      url: '',
      alt: 'Modern interior design',
      folder: 'Properties',
      linkedTo: 'Luxury Richmond Townhouse',
      size: '1.8 MB'
    },
    {
      id: 9,
      name: 'townhouse-bedroom.jpg',
      url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400',
      alt: 'Townhouse master bedroom',
      folder: 'Properties',
      linkedTo: 'Luxury Richmond Townhouse',
      size: '2.1 MB'
    },
    {
      id: 3,
      name: 'riverside-apartment-exterior.jpg',
      url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400',
      alt: 'Riverside apartment exterior',
      folder: 'Properties',
      linkedTo: 'Modern Riverside Apartment',
      size: '2.7 MB'
    },
    {
      id: 10,
      name: 'riverside-apartment-interior.jpg',
      url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400',
      alt: 'Riverside apartment interior',
      folder: 'Properties',
      linkedTo: 'Modern Riverside Apartment',
      size: '2.3 MB'
    },
    {
      id: 4,
      name: 'georgian-property-facade.jpg',
      url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=400',
      alt: 'Georgian property facade',
      folder: 'Properties',
      linkedTo: 'Georgian Period Property',
      size: '2.2 MB'
    },
    {
      id: 5,
      name: 'market-report-header.jpg',
      url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400',
      alt: 'Real estate market analysis',
      folder: 'Blog',
      linkedTo: 'Understanding Richmond\'s Property Market',
      size: '3.1 MB'
    },
    {
      id: 11,
      name: 'market-report-chart.jpg',
      url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400',
      alt: 'Market data chart',
      folder: 'Blog',
      linkedTo: 'Understanding Richmond\'s Property Market',
      size: '1.9 MB'
    },
    {
      id: 6,
      name: 'first-time-buyer-guide.jpg',
      url: 'https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=400',
      alt: 'First-time buyers guide',
      folder: 'Blog',
      linkedTo: 'First-Time Buyer\'s Guide to Richmond',
      size: '2.8 MB'
    },
    {
      id: 7,
      name: 'investment-opportunities.jpg',
      url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400',
      alt: 'Investment opportunities',
      folder: 'Blog',
      linkedTo: 'Investment Opportunities in South West London',
      size: '2.5 MB'
    },
    {
      id: 8,
      name: 'team-photo.jpg',
      url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400',
      alt: 'Team meeting',
      folder: 'Global',
      size: '1.5 MB'
    },
  ];

  // Filter media based on search and folder
  const filteredMedia = mediaItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.alt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.linkedTo && item.linkedTo.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFolder = folderFilter === 'All' || item.folder === folderFilter;
    const matchesSelectedFolder = selectedFolder ? item.linkedTo === selectedFolder : true;
    return matchesSearch && matchesFolder && matchesSelectedFolder;
  });

  // Group items by linkedTo for folder view
  const groupedItems = filteredMedia.reduce((acc, item) => {
    if (item.linkedTo) {
      if (!acc[item.linkedTo]) {
        acc[item.linkedTo] = [];
      }
      acc[item.linkedTo].push(item);
    } else {
      if (!acc['Uncategorized']) {
        acc['Uncategorized'] = [];
      }
      acc['Uncategorized'].push(item);
    }
    return acc;
  }, {} as Record<string, MediaItem[]>);

  // Determine if we should show folders or images
  const showFolderView = (folderFilter === 'Properties' || folderFilter === 'Blog') && !selectedFolder && !searchQuery;

  return (
    <CMSPageLayout
      title="Media Library"
      description="Manage your property images, blog assets, and site graphics."
      action={{ label: "Upload Image", icon: Upload, onClick: () => { alert('Upload feature coming soon'); } }}
    >
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between">
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          {['All', 'Properties', 'Blog', 'Global'].map((folder) => (
            <button
              key={folder}
              onClick={() => {
                setFolderFilter(folder);
                setSelectedFolder(null);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap text-sm font-medium ${folderFilter === folder
                ? 'bg-[#1A2551] text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                }`}
            >
              <Folder className="w-4 h-4" />
              <span>{folder}</span>
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search media..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1A2551] focus:border-[#1A2551] text-sm"
          />
        </div>
      </div>

      {/* Breadcrumb / Back button when in a specific folder */}
      {selectedFolder && (
        <div className="mb-6 animate-in slide-in-from-left-2">
          <button
            onClick={() => setSelectedFolder(null)}
            className="flex items-center gap-2 text-gray-500 hover:text-[#1A2551] transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back to {folderFilter} folders</span>
          </button>
          <h2 className="text-xl font-bold text-[#1A2551] mt-3">{selectedFolder}</h2>
        </div>
      )}

      {/* Folder Grid View (for Properties and Blog when no specific folder selected) */}
      {showFolderView ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Object.entries(groupedItems).map(([folderName, items]) => {
            // Get the first image as thumbnail
            const thumbnail = items[0];
            return (
              <div
                key={folderName}
                onClick={() => setSelectedFolder(folderName)}
                className="group bg-white rounded-xl border border-gray-200/80 overflow-hidden hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300 cursor-pointer"
              >
                <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                  <ImageWithFallback
                    src={thumbnail.url}
                    alt={thumbnail.alt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A2551]/80 to-transparent flex items-end opacity-80 group-hover:opacity-100 transition-opacity">
                    <div className="p-5 text-white w-full">
                      <div className="flex items-center gap-2 mb-1">
                        <Folder className="w-4 h-4 text-[#C5A059]" />
                        <span className="text-xs font-bold tracking-wider uppercase">{items.length} items</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-[#1A2551] mb-1 line-clamp-1">{folderName}</h3>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">{folderFilter}</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Image Grid View */
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredMedia.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedImage(item)}
              className="group relative bg-white rounded-xl border border-gray-200/80 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
            >
              <div className="aspect-square bg-gray-100 relative overflow-hidden">
                <ImageWithFallback
                  src={item.url}
                  alt={item.alt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage(item);
                    }}
                    className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors shadow-lg"
                    title="Edit Details"
                  >
                    <Edit className="w-4 h-4 text-[#1A2551]" />
                  </button>
                  <button
                    className="p-2 bg-white rounded-full hover:bg-red-50 transition-colors shadow-lg"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>

              <div className="p-4">
                <div className="text-sm font-medium text-[#1A2551] truncate mb-1">{item.name}</div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 font-mono">{item.size}</span>
                  {item.linkedTo && !selectedFolder && (
                    <Folder className="w-3 h-3 text-[#C5A059]" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {filteredMedia.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm mb-4">
            <ImageIcon className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-bold text-[#1A2551] mb-2">No media found</h3>
          <p className="text-gray-500 max-w-sm">Try adjusting your search or filters to find what you're looking for.</p>
        </div>
      )}

      {/* Edit Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-[#1A2551]">Media Details</h2>
              <button
                onClick={() => setSelectedImage(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Image Preview */}
                <div className="space-y-4">
                  <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                    <ImageWithFallback
                      src={selectedImage.url}
                      alt={selectedImage.alt}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm border border-gray-100">
                    <div className="flex justify-between">
                      <span className="text-gray-500">File size</span>
                      <span className="font-medium text-[#1A2551]">{selectedImage.size}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Dimensions</span>
                      <span className="font-medium text-[#1A2551]">1200 x 1200 px</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Type</span>
                      <span className="font-medium text-[#1A2551]">JPG</span>
                    </div>
                  </div>
                </div>

                {/* Metadata Fields */}
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">File Name</label>
                    <input
                      type="text"
                      defaultValue={selectedImage.name}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A2551] focus:bg-white transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Alt Text</label>
                    <input
                      type="text"
                      defaultValue={selectedImage.alt}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A2551] focus:bg-white transition-colors"
                    />
                    <p className="text-xs text-gray-400">Important for SEO and accessibility.</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Caption</label>
                    <textarea
                      rows={3}
                      placeholder="Add a caption..."
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A2551] focus:bg-white transition-colors resize-none"
                    />
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Asset Location</label>
                      <span className="text-xs px-2 py-1 bg-[#1A2551]/5 text-[#1A2551] rounded font-medium">{selectedImage.folder}</span>
                    </div>
                    {selectedImage.linkedTo && (
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <Folder className="w-3.5 h-3.5 text-[#C5A059]" />
                        {selectedImage.linkedTo}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setSelectedImage(null)}>
                Cancel
              </Button>
              <Button className="bg-[#1A2551] text-white hover:bg-[#1A2551]/90">
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </CMSPageLayout>
  );
}