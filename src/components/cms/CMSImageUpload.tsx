import { useState, useRef, useEffect } from 'react';
import { Upload, X, Loader2, Image as ImageIcon, AlertCircle, Trash2, Maximize2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../../components/ui/utils';
import { getImageMetadata, setImageMetadata } from '../../utils/imageMetadata';
import { OptimizedImage } from '../OptimizedImage';

interface CMSImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  description?: string;
  className?: string;
  bucket?: string;
  folder?: string;
  initialAlt?: string;
  onAltChange?: (alt: string) => void;
  variant?: 'default' | 'stack' | 'compact' | 'card';
}

import { supabase } from '../../utils/supabase/client';

export function CMSImageUpload({
  value,
  onChange,
  label,
  description,
  className,
  bucket = 'site-assets',
  folder = '',
  initialAlt,
  onAltChange,
  variant = 'default'
}: CMSImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [altText, setAltText] = useState(initialAlt || '');
  const [metadataLoading, setMetadataLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // If an initial alt is provided (controlled mode), use it
    if (initialAlt !== undefined) {
      setAltText(initialAlt);
    } else if (value && value.startsWith('http')) {
      // Otherwise try to fetch it from global metadata (uncontrolled mode)
      const fetchMetadata = async () => {
        setMetadataLoading(true);
        try {
          const meta = await getImageMetadata(value);
          if (meta && meta.alt) {
            setAltText(meta.alt);
          }
        } catch (e) {
          console.error('Failed to fetch image metadata', e);
        } finally {
          setMetadataLoading(false);
        }
      };
      fetchMetadata();
    } else {
      setAltText('');
    }
  }, [value, initialAlt]);

  const handleAltChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAlt = e.target.value;
    setAltText(newAlt);

    if (onAltChange) {
      onAltChange(newAlt);
    } else if (value) {
      // Save to global metadata store if no external handler
      try {
        await setImageMetadata(value, { alt: newAlt });
      } catch (err) {
        console.error('Failed to auto-save alt text', err);
      }
    }
  };

  const handleUpload = async (file: File) => {
    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
      toast.error('Image size must be less than 10MB');
      return;
    }

    setIsUploading(true);

    try {
      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = folder ? `${folder}/${fileName}` : fileName;

      // Use Edge Function to upload (bypasses RLS with service role key)
      const EDGE_FUNCTION_URL = `https://bylofefjrwvytskcivit.supabase.co/functions/v1/make-server-e2fc9a7e/upload?path=${encodeURIComponent(filePath)}`;

      const response = await fetch(EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': file.type,
        },
        body: file,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();

      if (result.url) {
        onChange(result.url);
        toast.success('Image uploaded successfully');
      } else {
        throw new Error('No URL returned from server');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(`Upload failed: ${error.message || 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (urlToDelete?: string, silent?: boolean) => {
    try {
      onChange('');
      setAltText('');
      if (!silent) {
        toast.success('Image removed');
      }
    } catch (error: any) {
      console.error('Delete error:', error);
      if (!silent) {
        toast.error('Failed to remove image');
      }
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  if (variant === 'compact') {
    return (
      <div className={cn('space-y-2', className)}>
        {label && (
          <label className="block text-sm font-medium text-gray-700">{label}</label>
        )}

        <div className="flex items-center gap-3">
          {value ? (
            <>
              <div className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                <OptimizedImage
                  src={value}
                  alt={altText || 'Preview'}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleDelete()}
                  className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors"
                  disabled={isUploading}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>

              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  value={altText}
                  onChange={handleAltChange}
                  placeholder="Alt text for accessibility..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2551] focus:border-transparent"
                  disabled={metadataLoading}
                />
                <p className="text-xs text-gray-500 mt-1">Describe this image for screen readers</p>
              </div>
            </>
          ) : (
            <div className="flex-1">
              <div
                onClick={() => inputRef.current?.click()}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={cn(
                  'relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
                  dragActive ? 'border-[#1A2551] bg-blue-50' : 'border-gray-300 hover:border-[#1A2551]',
                  isUploading && 'opacity-50 cursor-not-allowed'
                )}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleChange}
                  className="hidden"
                  disabled={isUploading}
                />
                {isUploading ? (
                  <Loader2 className="w-8 h-8 mx-auto text-[#1A2551] animate-spin" />
                ) : (
                  <>
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">Click or drag to upload</p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Card Variant - Compact card style, 4:3 aspect ratio, similar to gallery grid
  if (variant === 'card') {
    const [showPreview, setShowPreview] = useState(false);

    return (
      <div className={cn('space-y-2', className)}>
        {label && (
          <label className="block text-sm font-medium text-gray-700">{label}</label>
        )}

        <div className="group relative aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden border-2 border-transparent hover:border-gray-300 transition-all">
          {value ? (
            <>
              <div
                className="w-full h-full cursor-pointer"
                onClick={() => setShowPreview(true)}
              >
                <OptimizedImage
                  src={value}
                  alt={altText || 'Preview'}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

              {/* Controls */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowPreview(true)}
                  className="p-1.5 bg-white/90 text-gray-700 rounded-md hover:bg-white transition-colors shadow-sm backdrop-blur-sm"
                  title="Expand image"
                >
                  <Maximize2 className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete()}
                  className="p-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors shadow-sm"
                  title="Remove image"
                  disabled={isUploading}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>

              {/* Bottom Bar: Alt Text Trigger */}
              <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <input
                  type="text"
                  value={altText}
                  onChange={handleAltChange}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="Alt text..."
                  className="w-full px-2 py-1 text-xs bg-black/40 text-white border border-white/20 rounded backdrop-blur-sm placeholder-white/50 focus:outline-none focus:bg-black/60 focus:border-white/40"
                />
              </div>
            </>
          ) : (
            <div
              onClick={() => inputRef.current?.click()}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={cn(
                'absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors',
                dragActive && 'bg-blue-50'
              )}
            >
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={handleChange}
                className="hidden"
                disabled={isUploading}
              />
              {isUploading ? (
                <Loader2 className="w-6 h-6 text-[#1A2551] animate-spin" />
              ) : (
                <>
                  <Upload className="w-6 h-6 text-gray-400 mb-2" />
                  <span className="text-xs text-gray-500 font-medium">Upload</span>
                </>
              )}
            </div>
          )}
        </div>
        {description && !value && (
          <p className="text-xs text-gray-500">{description}</p>
        )}

        {/* Full Screen Preview */}
        {showPreview && value && (
          <div
            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setShowPreview(false)}
          >
            <button
              type="button"
              onClick={() => setShowPreview(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 p-2"
            >
              <X className="w-8 h-8" />
            </button>
            <img
              src={value}
              alt={altText || 'Preview'}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </div>
    );
  }


  // Stack variant - Image on top, alt text below
  if (variant === 'stack') {
    return (
      <div className={cn('space-y-3', className)}>
        {label && (
          <label className="block text-sm font-medium text-gray-700">{label}</label>
        )}

        {value ? (
          <>
            <div className="relative w-full bg-gray-100 rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
              <img
                src={value}
                alt={altText || 'Preview'}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleDelete()}
                className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1.5 hover:bg-red-700 transition-colors shadow-lg"
                disabled={isUploading}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <input
                type="text"
                value={altText}
                onChange={handleAltChange}
                placeholder="Alt text for accessibility..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2551] focus:border-transparent"
                disabled={metadataLoading}
              />
              <p className="text-xs text-gray-500 mt-1.5">Describe this image for screen readers</p>
            </div>
          </>
        ) : (
          <div
            onClick={() => inputRef.current?.click()}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={cn(
              'relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
              dragActive ? 'border-[#1A2551] bg-blue-50' : 'border-gray-300 hover:border-[#1A2551]',
              isUploading && 'opacity-50 cursor-not-allowed'
            )}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={handleChange}
              className="hidden"
              disabled={isUploading}
            />
            {isUploading ? (
              <div className="space-y-2">
                <Loader2 className="w-10 h-10 mx-auto text-[#1A2551] animate-spin" />
                <p className="text-sm text-gray-600">Uploading...</p>
              </div>
            ) : (
              <>
                <Upload className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                <p className="text-sm font-medium text-gray-700 mb-1">Click or drag image to upload</p>
                <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
              </>
            )}
          </div>
        )}

        {description && (
          <p className="text-xs text-gray-500">{description}</p>
        )}
      </div>
    );
  }

  // Default variant - Side by side
  return (
    <div className={cn('space-y-3', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">{label}</label>
      )}

      <div className="grid grid-cols-2 gap-4">
        {/* Upload area */}
        <div>
          {value ? (
            <div className="relative w-full bg-gray-100 rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
              <img
                src={value}
                alt={altText || 'Preview'}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleDelete()}
                className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1.5 hover:bg-red-700 transition-colors shadow-lg"
                disabled={isUploading}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => inputRef.current?.click()}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={cn(
                'relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
                dragActive ? 'border-[#1A2551] bg-blue-50' : 'border-gray-300 hover:border-[#1A2551]',
                isUploading && 'opacity-50 cursor-not-allowed'
              )}
              style={{ aspectRatio: '16/9' }}
            >
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={handleChange}
                className="hidden"
                disabled={isUploading}
              />
              {isUploading ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <Loader2 className="w-10 h-10 text-[#1A2551] animate-spin mb-2" />
                  <p className="text-sm text-gray-600">Uploading...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <Upload className="w-10 h-10 mb-3 text-gray-400" />
                  <p className="text-sm font-medium text-gray-700 mb-1">Click or drag to upload</p>
                  <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Alt text input */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-2">Alt Text</label>
          <input
            type="text"
            value={altText}
            onChange={handleAltChange}
            placeholder="Describe this image..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2551] focus:border-transparent"
            disabled={metadataLoading || !value}
          />
          <p className="text-xs text-gray-500 mt-2">
            Alt text helps screen readers describe images to visually impaired users
          </p>
        </div>
      </div>

      {description && (
        <p className="text-xs text-gray-500">{description}</p>
      )}
    </div>
  );
}