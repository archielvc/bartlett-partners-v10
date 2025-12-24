import { useState, useCallback, useRef, useEffect } from 'react';
import { Upload, FolderUp, RefreshCw, Check, AlertCircle, FileImage, Home, X, Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../../utils/supabase/client';
import { Button } from '../../ui/button';
import { cn } from '../../ui/utils';

interface Property {
    id: number;
    title: string;
}

interface FileEntry {
    file: File;
    type: 'hero' | 'floorplan' | 'gallery';
    status: 'pending' | 'uploading' | 'complete' | 'error';
    url?: string;
}

interface PropertyGroup {
    propertyId: number | null;
    propertyName: string; // From folder name
    matchedProperty?: Property;
    files: FileEntry[];
    status: 'pending' | 'uploading' | 'complete' | 'error';
    progress: number;
}


// Custom hook for visibility detection (since we don't have react-intersection-observer)
function useInView(options = {}) {
    const [isIntersecting, setIntersecting] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            setIntersecting(entry.isIntersecting);
        }, options);

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return [ref, isIntersecting] as const;
}

// Component to handle lazy preview generation
// This ensures we only hold Object URLs for images currently in view (or close to it)
const LazyImagePreview = ({ file, alt }: { file: File, alt: string }) => {
    const [ref, isInView] = useInView({ rootMargin: '200px' }); // Render 200px ahead
    const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined);

    useEffect(() => {
        let url: string | undefined;
        if (isInView) {
            try {
                url = URL.createObjectURL(file);
                setPreviewUrl(url);
            } catch (e) {
                console.warn('Failed to create object URL', e);
            }
        }

        return () => {
            if (url) {
                URL.revokeObjectURL(url);
            }
            setPreviewUrl(undefined);
        };
    }, [isInView, file]);

    return (
        <div ref={ref} className="w-full h-full flex items-center justify-center bg-gray-100">
            {isInView && previewUrl ? (
                <img
                    src={previewUrl}
                    alt={alt}
                    className="w-full h-full object-cover animate-in fade-in duration-300"
                />
            ) : (
                <Loader2 className="w-6 h-6 text-gray-300 animate-pulse" />
            )}
        </div>
    );
};

export function CMSBulkImageUpload() {
    const [isDragActive, setIsDragActive] = useState(false);
    const [groups, setGroups] = useState<PropertyGroup[]>([]);
    const [properties, setProperties] = useState<Property[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    // Removed previewUrl state as it is now handled locally by LazyImagePreview

    // Fetch properties for matching
    const fetchProperties = async () => {
        try {
            const { data, error } = await supabase
                .from('properties')
                .select('id, title')
                .order('title');

            if (error) throw error;
            setProperties(data || []);
            return data || [];
        } catch (error) {
            console.error('Error fetching properties:', error);
            toast.error('Failed to load property list');
            return [];
        }
    };

    const smartSortFile = (filename: string): 'hero' | 'floorplan' | 'gallery' => {
        const lowerName = filename.toLowerCase();

        // Hero detection
        if (
            lowerName.includes('hero') ||
            lowerName.includes('main') ||
            lowerName.includes('front') ||
            lowerName.includes('exterior')
        ) {
            return 'hero';
        }

        // Floorplan detection
        if (
            lowerName.includes('floorplan') ||
            lowerName.includes('plan') ||
            lowerName.includes('layout') ||
            lowerName.includes('dimensions')
        ) {
            return 'floorplan';
        }

        return 'gallery';
    };

    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragActive(false);
        setIsProcessing(true);

        try {
            const items = Array.from(e.dataTransfer.items).filter(item => item.kind === 'file');
            if (items.length === 0) {
                setIsProcessing(false);
                return;
            }

            // Capture entries synchronously before any await
            const rootEntries = items.map(item => item.webkitGetAsEntry()).filter(Boolean);

            // Ensure we have properties
            let currentProperties = properties;
            if (currentProperties.length === 0) {
                currentProperties = await fetchProperties();
            }

            // Sort properties by length descending to prioritize longer matches (e.g. "Main St 2" before "Main St")
            currentProperties.sort((a, b) => b.title.length - a.title.length);

            const newGroups: PropertyGroup[] = [];

            // Helper to safely read directory entries
            const readEntriesPromise = (dirReader: any): Promise<any[]> => {
                return new Promise((resolve, reject) => {
                    dirReader.readEntries(
                        (entries: any[]) => resolve(entries),
                        (err: any) => reject(err)
                    );
                });
            };

            // Helper to safely read file from entry
            const readFilePromise = (fileEntry: any): Promise<File> => {
                return new Promise((resolve, reject) => {
                    fileEntry.file(
                        (file: File) => resolve(file),
                        (err: any) => reject(err)
                    );
                });
            };

            // Recursive scanner
            const scanEntry = async (entry: any): Promise<File[]> => {
                if (!entry) return [];

                if (entry.isFile) {
                    try {
                        const file = await readFilePromise(entry);
                        return [file];
                    } catch (e) {
                        console.error('Error reading file entry:', entry.name, e);
                        return [];
                    }
                } else if (entry.isDirectory) {
                    try {
                        const dirReader = entry.createReader();
                        let allEntries: any[] = [];
                        let batch: any[] = [];

                        // readEntries must be called repeatedly until it returns no more entries
                        do {
                            batch = await readEntriesPromise(dirReader);
                            if (batch.length > 0) {
                                allEntries = allEntries.concat(batch);
                            }
                        } while (batch.length > 0);

                        const files = await Promise.all(allEntries.map(e => scanEntry(e)));
                        return files.flat();
                    } catch (e) {
                        console.error('Error reading directory:', entry.name, e);
                        return [];
                    }
                }
                return [];
            };

            for (const entry of rootEntries) {
                if (!entry) continue;

                // We treat top-level directories as "Property Groups"
                if (entry.isDirectory) {
                    const files = await scanEntry(entry);
                    const imageFiles = files.filter(f => f.type.startsWith('image/'));

                    if (imageFiles.length > 0) {
                        const folderName = entry.name;
                        // Find match
                        const match = currentProperties.find(p =>
                            p.title.toLowerCase().trim() === folderName.toLowerCase().trim() ||
                            p.title.toLowerCase().includes(folderName.toLowerCase()) ||
                            folderName.toLowerCase().includes(p.title.toLowerCase())
                        );

                        // No need to throttle createObjectURL anymore as component handles it lazily
                        const fileEntries: FileEntry[] = imageFiles.map(file => ({
                            file,
                            type: smartSortFile(file.name),
                            status: 'pending'
                        }));

                        newGroups.push({
                            propertyId: match ? match.id : null,
                            propertyName: folderName,
                            matchedProperty: match,
                            files: fileEntries,
                            status: 'pending',
                            progress: 0
                        });
                    }
                } else if (entry.isFile) {
                    // Ignore loose files as per requirement
                }
            }

            if (newGroups.length === 0) {
                toast.error('No valid property folders found');
            } else {
                setGroups(prev => [...prev, ...newGroups]);
                toast.success(`Processed ${newGroups.length} folders`);
            }

        } catch (error) {
            console.error('Error processing files:', error);
            toast.error('Failed to process dropped folders');
        } finally {
            setIsProcessing(false);
        }
    }, [properties]);

    const handleUploadGroup = async (groupIndex: number) => {
        const group = groups[groupIndex];
        if (!group.matchedProperty) {
            toast.error(`No property matched for ${group.propertyName}`);
            return;
        }

        setGroups(prev => {
            const newGroups = [...prev];
            newGroups[groupIndex].status = 'uploading';
            return newGroups;
        });

        try {
            // Process uploads 3 at a time to avoid overwhelming connections
            const chunks = [];
            const chunkSize = 3;
            for (let i = 0; i < group.files.length; i += chunkSize) {
                chunks.push(group.files.slice(i, i + chunkSize));
            }

            let allResults: FileEntry[] = [...group.files]; // Start with current state logic?
            // Actually we need to update the results in place.
            // Let's just track results array.

            const results: FileEntry[] = [...group.files];

            for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
                const chunk = chunks[chunkIndex];
                const chunkPromises = chunk.map(async (fileEntry) => {
                    // Find index in original array to update results correctly if using map,
                    // but here we just process the entry.
                    if (fileEntry.status === 'complete') return fileEntry;

                    try {
                        const fileExt = fileEntry.file.name.split('.').pop();
                        const fileName = `properties/${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
                        const EDGE_FUNCTION_URL = `https://bylofefjrwvytskcivit.supabase.co/functions/v1/make-server-e2fc9a7e/upload?path=${encodeURIComponent(fileName)}`;

                        const response = await fetch(EDGE_FUNCTION_URL, {
                            method: 'POST',
                            headers: {
                                'Content-Type': fileEntry.file.type,
                            },
                            body: fileEntry.file,
                        });

                        if (!response.ok) throw new Error('Upload failed');
                        const result = await response.json();

                        return {
                            ...fileEntry,
                            status: 'complete',
                            url: result.url
                        } as FileEntry;

                    } catch (e) {
                        console.error(e);
                        return { ...fileEntry, status: 'error' } as FileEntry;
                    }
                });

                const chunkResults = await Promise.all(chunkPromises);

                // Update results array
                // We need to match back to original indices or just trust order if we sliced correctly?
                // The chunk corresponds to i to i+chunkSize
                const startIndex = chunkIndex * chunkSize;
                for (let k = 0; k < chunkResults.length; k++) {
                    results[startIndex + k] = chunkResults[k];
                }

                // Optional: Update progress UI here if we wanted fine-grained progress
            }

            const successful = results.filter(r => r.status === 'complete' && r.url);

            if (successful.length > 0) {
                // Update Database
                const hero = successful.find(r => r.type === 'hero')?.url;
                const floorplan = successful.find(r => r.type === 'floorplan')?.url;

                // STRICT FILTERING: Only include items explicitly marked as 'gallery' in the gallery list.
                // User requested that 'hero' and 'floorplan' items should NOT appear in gallery.
                // This means if there are multiple 'hero' images, the extras are simply ignored (uploaded but not linked).
                const gallery = successful
                    .filter(r => r.type === 'gallery')
                    .map(r => r.url!);

                // Fetch current gallery to append
                const { data: currentProp } = await supabase
                    .from('properties')
                    .select('gallery_images')
                    .eq('id', group.matchedProperty.id)
                    .single();

                // Deduplicate: Filter out any new URLs that already exist in the database
                const existingImages = new Set(currentProp?.gallery_images || []);
                const uniqueNewGallery = gallery.filter(url => !existingImages.has(url));

                const newGallery = [...(currentProp?.gallery_images || []), ...uniqueNewGallery];

                const updateData: any = { gallery_images: newGallery };
                if (hero) updateData.hero_image = hero;
                if (floorplan) updateData.floor_plan_image = floorplan;

                const { error } = await supabase
                    .from('properties')
                    .update(updateData)
                    .eq('id', group.matchedProperty.id);

                if (error) throw error;
            }

            setGroups(prev => {
                const newGroups = [...prev];
                newGroups[groupIndex] = {
                    ...group,
                    files: results,
                    status: 'complete',
                    progress: 100
                };
                return newGroups;
            });

            toast.success(`Uploaded files for ${group.matchedProperty.title}`);

        } catch (error) {
            console.error(error);
            setGroups(prev => {
                const newGroups = [...prev];
                newGroups[groupIndex].status = 'error';
                return newGroups;
            });
            toast.error(`Failed to upload for ${group.propertyName}`);
        }
    };

    const handleUploadAll = async () => {
        setIsUploading(true);
        const pendingGroups = groups.map((g, i) => ({ g, i })).filter(({ g }) => g.status === 'pending' && g.matchedProperty);

        for (const { i } of pendingGroups) {
            await handleUploadGroup(i);
        }
        setIsUploading(false);
    };

    // UI Helpers
    const removeGroup = (index: number) => {
        setGroups(prev => prev.filter((_, i) => i !== index));
    };

    const changeFileType = (groupIndex: number, fileIndex: number, newType: 'hero' | 'floorplan' | 'gallery') => {
        setGroups(prev => {
            const newGroups = [...prev];
            newGroups[groupIndex].files[fileIndex].type = newType;
            return newGroups;
        });
    };


    // Removed global useEffect cleanup for previewUrls as LazyImagePreview handles it locally.

    return (
        <div className="h-full flex flex-col bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-8 py-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-[#1A2551]">Bulk Image Upload</h1>
                        <p className="text-gray-500 mt-1">Drag and drop folders named after your properties to automatically assign images.</p>
                    </div>
                    <div className="flex gap-3">
                        {groups.length > 0 && (
                            <Button
                                onClick={() => setGroups([])}
                                variant="outline"
                                disabled={isUploading}
                            >
                                Clear All
                            </Button>
                        )}
                        <Button
                            onClick={handleUploadAll}
                            disabled={isUploading || groups.filter(g => g.status === 'pending' && g.matchedProperty).length === 0}
                            className="bg-[#1A2551] hover:bg-[#0D1229]"
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Upload className="w-4 h-4 mr-2" />
                                    Save Properties
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-8 overflow-y-auto">

                {/* Dropzone */}
                {groups.length === 0 && (
                    <div
                        className={cn(
                            "border-4 border-dashed rounded-xl p-16 text-center transition-all min-h-[400px] flex flex-col items-center justify-center",
                            isDragActive ? "border-[#1A2551] bg-blue-50" : "border-gray-300 hover:border-gray-400 bg-white"
                        )}
                        onDragEnter={(e) => { e.preventDefault(); setIsDragActive(true); }}
                        onDragOver={(e) => { e.preventDefault(); setIsDragActive(true); }}
                        onDragLeave={(e) => { e.preventDefault(); setIsDragActive(false); }}
                        onDrop={handleDrop}
                    >
                        <div className="w-20 h-20 bg-blue-100 text-[#1A2551] rounded-full flex items-center justify-center mb-6">
                            <FolderUp className="w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Drag Property Folders Here</h3>
                        <p className="text-gray-500 max-w-md mx-auto">
                            Drop folders containing property images. We'll match folder names to properties and auto-sort Hero and Floorplan images.
                        </p>
                        {isProcessing && (
                            <div className="mt-8 flex items-center gap-2 text-[#1A2551] font-medium animate-pulse">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Processing folders...
                            </div>
                        )}
                    </div>
                )}

                {/* Groups List */}
                <div className="space-y-6">
                    {groups.map((group, groupIndex) => (
                        <div key={groupIndex} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            {/* Group Header */}
                            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-10 h-10 rounded-lg flex items-center justify-center",
                                        group.matchedProperty ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                    )}>
                                        {group.matchedProperty ? <Home className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                            {group.propertyName}
                                            {group.matchedProperty && (
                                                <ArrowRight className="w-4 h-4 text-gray-400" />
                                            )}
                                            {group.matchedProperty ? (
                                                <span className="text-[#1A2551]">{group.matchedProperty.title}</span>
                                            ) : (
                                                <span className="text-red-500 text-sm font-normal">(No match found)</span>
                                            )}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {group.files.length} images found
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {group.status === 'complete' && (
                                        <span className="flex items-center text-green-600 text-sm font-medium">
                                            <Check className="w-4 h-4 mr-1" /> Saved
                                        </span>
                                    )}
                                    {group.status === 'error' && (
                                        <span className="text-red-600 text-sm font-medium">Save Failed</span>
                                    )}
                                    {group.status === 'uploading' && (
                                        <Loader2 className="w-5 h-5 animate-spin text-[#1A2551]" />
                                    )}
                                    <button
                                        onClick={() => removeGroup(groupIndex)}
                                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Files Grid */}
                            <div className="p-6">
                                <div className="grid grid-cols-4 gap-4">
                                    {group.files.map((fileEntry, fileIndex) => (
                                        <div key={fileIndex} className="group relative aspect-square bg-gray-100 rounded-lg border border-gray-200 overflow-hidden">
                                            {/* Sort Badge */}
                                            <div className={cn(
                                                "absolute top-2 left-2 z-10 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm",
                                                fileEntry.type === 'hero' && "bg-[#1A2551] text-white",
                                                fileEntry.type === 'floorplan' && "bg-[#8E8567] text-white",
                                                fileEntry.type === 'gallery' && "bg-white text-gray-700"
                                            )}>
                                                {fileEntry.type}
                                            </div>

                                            {/* Type Toggle (Hover) */}
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2 z-20">
                                                <button
                                                    onClick={() => changeFileType(groupIndex, fileIndex, 'hero')}
                                                    className={cn("text-xs px-2 py-1 rounded w-full", fileEntry.type === 'hero' ? "bg-[#1A2551] text-white" : "bg-white/20 text-white hover:bg-white/40")}
                                                >
                                                    Set as Hero
                                                </button>
                                                <button
                                                    onClick={() => changeFileType(groupIndex, fileIndex, 'floorplan')}
                                                    className={cn("text-xs px-2 py-1 rounded w-full", fileEntry.type === 'floorplan' ? "bg-[#8E8567] text-white" : "bg-white/20 text-white hover:bg-white/40")}
                                                >
                                                    Set as Floorplan
                                                </button>
                                                <button
                                                    onClick={() => changeFileType(groupIndex, fileIndex, 'gallery')}
                                                    className={cn("text-xs px-2 py-1 rounded w-full", fileEntry.type === 'gallery' ? "bg-white text-gray-900" : "bg-white/20 text-white hover:bg-white/40")}
                                                >
                                                    Set as Gallery
                                                </button>
                                            </div>

                                            <div className="w-full h-full">
                                                <LazyImagePreview
                                                    file={fileEntry.file}
                                                    alt={fileEntry.file.name}
                                                />
                                            </div>
                                            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] p-1 truncate">
                                                {fileEntry.file.name}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Bottom Dropzone (Smaller) */}
                    {groups.length > 0 && !isProcessing && (
                        <div
                            className={cn(
                                "border-2 border-dashed rounded-xl p-8 text-center transition-all",
                                isDragActive ? "border-[#1A2551] bg-blue-50" : "border-gray-300 hover:border-gray-400 bg-white"
                            )}
                            onDragEnter={(e) => { e.preventDefault(); setIsDragActive(true); }}
                            onDragOver={(e) => { e.preventDefault(); setIsDragActive(true); }}
                            onDragLeave={(e) => { e.preventDefault(); setIsDragActive(false); }}
                            onDrop={handleDrop}
                        >
                            <p className="text-gray-500 font-medium">Drag more folders here to add to the list</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
