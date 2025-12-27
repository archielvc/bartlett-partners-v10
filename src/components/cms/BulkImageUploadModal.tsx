import React, { useState, useCallback, useEffect } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { X, Upload, GripVertical, Image as ImageIcon, Check, Loader2, ArrowRight, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';
import type { BlogPost } from '../../types/database';
import { compressImage } from '../../utils/imageCompression';
import { updateBlogPost } from '../../utils/database';
import { supabase } from '../../utils/supabase/client';

interface BulkImageUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUploadComplete: () => void;
    posts: BlogPost[];
}

interface ImageFile {
    id: string;
    file: File;
    preview: string;
}

// Sortable Item Component
function SortableImageItem({
    id,
    file,
    preview,
    index,
    matchedPost,
}: {
    id: string;
    file: File;
    preview: string;
    index: number;
    matchedPost?: BlogPost;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 100 : 'auto',
        position: 'relative' as 'relative',
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "flex items-center gap-3 p-3 bg-white rounded-lg border mb-2 group",
                isDragging ? "shadow-lg border-[#1A2551] ring-1 ring-[#1A2551]" : "border-gray-200 hover:border-gray-300",
                !matchedPost && "opacity-50"
            )}
        >
            <div {...attributes} {...listeners} className="text-gray-400 cursor-grab hover:text-gray-600">
                <GripVertical className="w-5 h-5" />
            </div>

            <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                <img src={preview} alt={file.name} className="w-full h-full object-cover" />
            </div>

            <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 font-mono truncate">{file.name}</p>
                <div className="flex items-center gap-2 mt-1">
                    <ArrowRight className="w-3 h-3 text-gray-400" />
                    {matchedPost ? (
                        <span className="text-sm font-medium text-[#1A2551] truncate block max-w-[200px]">
                            {matchedPost.title}
                        </span>
                    ) : (
                        <span className="text-xs text-red-400 italic">No post to match</span>
                    )}
                </div>
            </div>

            <div className="text-xs text-gray-400 font-mono">
                #{index + 1}
            </div>
        </div>
    );
}

export function BulkImageUploadModal({ isOpen, onClose, onUploadComplete, posts }: BulkImageUploadModalProps) {
    const [files, setFiles] = useState<ImageFile[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Clean up object URLs
    useEffect(() => {
        return () => {
            files.forEach(f => URL.revokeObjectURL(f.preview));
        };
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files).map(file => ({
                id: Math.random().toString(36).substring(7),
                file,
                preview: URL.createObjectURL(file)
            }));

            // Natural numeric sort: 1, 2, 10 instead of 1, 10, 2
            newFiles.sort((a, b) => a.file.name.localeCompare(b.file.name, undefined, { numeric: true, sensitivity: 'base' }));

            setFiles(prev => [...prev, ...newFiles]);
        }
        // Reset input
        e.target.value = '';
    };

    const handleDragEnd = (event: any) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            setFiles((items) => {
                const oldIndex = items.findIndex(i => i.id === active.id);
                const newIndex = items.findIndex(i => i.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
        setActiveId(null);
    };

    const handleDragStart = (event: any) => {
        setActiveId(event.active.id);
    };

    const handleRemoveFile = (id: string) => {
        setFiles(prev => {
            const file = prev.find(f => f.id === id);
            if (file) URL.revokeObjectURL(file.preview);
            return prev.filter(f => f.id !== id);
        });
    };

    const clearAll = () => {
        files.forEach(f => URL.revokeObjectURL(f.preview));
        setFiles([]);
    };

    const handleUpload = async () => {
        if (files.length === 0) return;

        setIsUploading(true);
        setProgress(0);

        let uploadedCount = 0;
        let errorCount = 0;

        // Pairs to process: Min(files, posts)
        const pairsToProcess = Math.min(files.length, posts.length);

        try {
            for (let i = 0; i < pairsToProcess; i++) {
                const { file } = files[i];
                const post = posts[i];

                try {
                    // 1. Compress
                    let fileToUpload = file;
                    if (file.size > 2 * 1024 * 1024) { // Compress if > 2MB
                        try {
                            fileToUpload = await compressImage(file, { maxWidth: 1920, quality: 0.8 });
                        } catch (e) {
                            console.warn('Compression failed, using original', e);
                        }
                    }

                    // 2. Upload via Edge Function (reusing existing logic pattern)
                    const fileExt = fileToUpload.name.split('.').pop();
                    const fileName = `blog/${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
                    const EDGE_FUNCTION_URL = `https://bylofefjrwvytskcivit.supabase.co/functions/v1/make-server-e2fc9a7e/upload?path=${encodeURIComponent(fileName)}`;

                    const response = await fetch(EDGE_FUNCTION_URL, {
                        method: 'POST',
                        headers: {
                            'Content-Type': fileToUpload.type,
                        },
                        body: fileToUpload,
                    });

                    if (!response.ok) throw new Error('Upload failed');
                    const result = await response.json();

                    if (!result.url) throw new Error('No URL returned');

                    // 3. Update Blog Post
                    await updateBlogPost(post.id, {
                        featured_image: result.url,
                        featured_image_alt: post.title // Default alt text to title
                    });

                    uploadedCount++;

                } catch (error) {
                    console.error(`Failed to upload for post ${post.title}:`, error);
                    errorCount++;
                }

                // Update progress
                setProgress(Math.round(((i + 1) / pairsToProcess) * 100));
            }

            if (uploadedCount > 0) {
                toast.success(`Successfully updated ${uploadedCount} blog posts!`);
                onUploadComplete();
                onClose();
                setFiles([]); // Clear only on success
            }

            if (errorCount > 0) {
                toast.error(`Failed to update ${errorCount} posts.`);
            }

        } catch (e) {
            console.error('Bulk upload fatal error', e);
            toast.error('Something went wrong during bulk upload');
        } finally {
            setIsUploading(false);
        }
    };

    const [isDragActive, setIsDragActive] = useState(false);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragActive(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragActive(false);
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const newFiles = Array.from(e.dataTransfer.files)
                .filter(file => file.type.startsWith('image/'))
                .map(file => ({
                    id: Math.random().toString(36).substring(7),
                    file,
                    preview: URL.createObjectURL(file)
                }));

            // Natural numeric sort: 1, 2, 10 instead of 1, 10, 2
            newFiles.sort((a, b) => a.file.name.localeCompare(b.file.name, undefined, { numeric: true, sensitivity: 'base' }));
            setFiles(prev => [...prev, ...newFiles]);
        }
    }, []);

    // ... existing handleFileSelect ...

    return (
        <Dialog open={isOpen} onOpenChange={isUploading ? undefined : (open: boolean) => !open && onClose()}>
            <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0 overflow-hidden">
                {/* ... Header ... */}
                <DialogHeader className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className="text-xl font-bold text-[#1A2551]">Bulk Image Upload</DialogTitle>
                            <DialogDescription className="mt-1">
                                Drag and drop images to match them with your blog posts.
                            </DialogDescription>
                        </div>
                        {files.length > 0 && !isUploading && (
                            <Button variant="ghost" size="sm" onClick={clearAll} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                                Clear All
                            </Button>
                        )}
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-hidden flex flex-col md:flex-row bg-gray-50/30">
                    {/* LEFT: Logic / Dropzone */}
                    <div className="w-full md:w-1/2 p-4 flex flex-col border-b md:border-b-0 md:border-r border-gray-200 overflow-hidden">

                        {/* Upload Drop Impl */}
                        <div className="mb-4">
                            <input
                                type="file"
                                id="bulk-upload-input"
                                multiple
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileSelect}
                                disabled={isUploading}
                            />
                            <label
                                htmlFor="bulk-upload-input"
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={cn(
                                    "flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer transition-all",
                                    isDragActive ? "border-[#1A2551] bg-blue-50" : "border-gray-300 hover:border-[#1A2551] hover:bg-blue-50",
                                    isUploading && "opacity-50 pointer-events-none"
                                )}
                            >
                                <Upload className={cn("w-8 h-8 mb-2", isDragActive ? "text-[#1A2551]" : "text-gray-400")} />
                                <span className={cn("text-sm font-medium", isDragActive ? "text-[#1A2551]" : "text-gray-700")}>
                                    {isDragActive ? "Drop images here" : "Click or Drag Images Here"}
                                </span>
                                <span className="text-xs text-gray-400 mt-1">Select multiple files at once</span>
                            </label>
                        </div>

                        {/* Drag Sort Context */}
                        <div className="flex-1 overflow-y-auto pr-2">
                            {files.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-400">
                                    <ImageIcon className="w-12 h-12 mb-3 opacity-20" />
                                    <p className="text-sm">No images selected</p>
                                </div>
                            ) : (
                                <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragStart={handleDragStart}
                                    onDragEnd={handleDragEnd}
                                >
                                    <SortableContext
                                        items={files.map(f => f.id)}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        {files.map((file, index) => (
                                            <SortableImageItem
                                                key={file.id}
                                                id={file.id}
                                                file={file.file}
                                                preview={file.preview}
                                                index={index}
                                                matchedPost={posts[index]}
                                            />
                                        ))}
                                    </SortableContext>
                                    <DragOverlay>
                                        {activeId ? (
                                            <div className="p-3 bg-white rounded-lg shadow-xl border border-[#1A2551] opacity-90">
                                                <div className="flex items-center gap-3">
                                                    <GripVertical className="w-5 h-5 text-[#1A2551]" />
                                                    <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden">
                                                        {(() => {
                                                            const f = files.find(x => x.id === activeId);
                                                            return f ? <img src={f.preview} className="w-full h-full object-cover" /> : null;
                                                        })()}
                                                    </div>
                                                    <span className="font-medium text-[#1A2551]">Moving...</span>
                                                </div>
                                            </div>
                                        ) : null}
                                    </DragOverlay>
                                </DndContext>
                            )}
                        </div>
                    </div>

                    {/* RIGHT: Target Posts */}
                    <div className="w-full md:w-1/2 p-4 flex flex-col bg-gray-50 h-[300px] md:h-auto border-gray-200">
                        <div className="mb-3 flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Target Blog Posts</h3>
                            <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border shadow-sm">
                                {posts.length} posts visible
                            </span>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                            {posts.length === 0 ? (
                                <div className="text-center py-10 text-gray-500 italic text-sm">
                                    No posts available in current view.
                                </div>
                            ) : (
                                posts.map((post, index) => {
                                    const hasImage = index < files.length;
                                    return (
                                        <div
                                            key={post.id}
                                            className={cn(
                                                "p-3 rounded-lg border text-sm flex items-center justify-between",
                                                hasImage ? "bg-blue-50/50 border-blue-100 text-blue-900" : "bg-white border-gray-100 text-gray-500"
                                            )}
                                        >
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <span className="w-6 h-6 flex-shrink-0 flex items-center justify-center rounded-full bg-white text-xs font-mono border border-gray-200 text-gray-400">
                                                    {index + 1}
                                                </span>
                                                <span className="truncate font-medium">{post.title}</span>
                                            </div>

                                            {hasImage ? (
                                                <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                            ) : (
                                                <span className="text-[10px] text-gray-300">Start adding images...</span>
                                            )}
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer actions */}
                <div className="p-4 border-t border-gray-100 bg-white flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                        {files.length > 0 && (
                            <>
                                <span className="font-medium text-[#1A2551]">{Math.min(files.length, posts.length)}</span> matches ready
                            </>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <Button variant="outline" onClick={() => onClose()} disabled={isUploading}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUpload}
                            disabled={files.length === 0 || isUploading}
                            className="bg-[#1A2551] text-white hover:bg-[#1A2551]/90 min-w-[120px]"
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    {progress}%
                                </>
                            ) : (
                                <>
                                    <Upload className="w-4 h-4 mr-2" />
                                    Upload All
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
