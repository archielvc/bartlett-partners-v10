import { useState, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../../components/ui/utils';
import { compressImage } from '../../utils/imageCompression';

interface CMSMultiImageUploadProps {
  onImagesUploaded: (urls: string[]) => void;
  className?: string;
  variant?: 'default' | 'button';
  label?: string;
}

export function CMSMultiImageUpload({
  onImagesUploaded,
  className,
  variant = 'default',
  label = 'Add Images'
}: CMSMultiImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (files: FileList) => {
    const validFiles: File[] = [];

    // Validate all files first
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        continue;
      }
      // logic change: accept all images, we will handle compression later if needed
      // (or we can warn here but still allow?)
      // Let's just allow them and compress.
      validFiles.push(file);
    }

    if (validFiles.length === 0) {
      return;
    }

    setIsUploading(true);

    try {
      const uploadedUrls: string[] = [];

      // Upload each file to Supabase Storage via Edge Function
      for (const file of validFiles) {
        let fileToUpload = file;

        // If file is larger than 10MB, try to compress it
        if (file.size > 10 * 1024 * 1024) {
          try {
            // Show loading toast or update status
            const toastId = toast.loading(`Compressing ${file.name}...`);
            fileToUpload = await compressImage(file, {
              maxWidth: 2048,
              quality: 0.8
            });
            toast.dismiss(toastId);

            if (fileToUpload.size > 10 * 1024 * 1024) {
              const sizeMB = (fileToUpload.size / (1024 * 1024)).toFixed(2);
              toast.error(`${file.name} is still too large (${sizeMB}MB) after compression.`);
              continue;
            }
          } catch (error) {
            console.error(`Compression failed for ${file.name}:`, error);
            toast.error(`Failed to compress ${file.name}. Error: ${error}`);
            continue;
          }
        } else {
          console.log(`File ${file.name} is ${(file.size / (1024 * 1024)).toFixed(2)}MB - no compression needed`);
        }

        // Create a unique file name
        const fileExt = fileToUpload.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        // Default to property-images folder for multi-upload
        const folder = 'property-images';
        const filePath = `${folder}/${fileName}`;

        // Use Edge Function to upload (bypasses RLS with service role key)
        const EDGE_FUNCTION_URL = `https://bylofefjrwvytskcivit.supabase.co/functions/v1/make-server-e2fc9a7e/upload?path=${encodeURIComponent(filePath)}`;

        const response = await fetch(EDGE_FUNCTION_URL, {
          method: 'POST',
          headers: {
            'Content-Type': fileToUpload.type,
          },
          body: fileToUpload,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to upload ${file.name}`);
        }

        const result = await response.json();

        if (result.url) {
          uploadedUrls.push(result.url);
        } else {
          throw new Error(`No URL returned for ${file.name}`);
        }
      }

      onImagesUploaded(uploadedUrls);
      toast.success(`${uploadedUrls.length} image${uploadedUrls.length > 1 ? 's' : ''} uploaded successfully`);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(`Upload failed: ${error.message || 'Unknown error'} (Server Response)`);
    } finally {
      setIsUploading(false);
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

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      handleUpload(e.target.files);
    }
  };

  if (variant === 'button') {
    return (
      <div className={className}>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleChange}
          className="hidden"
          disabled={isUploading}
        />
        <button
          type="button"
          onClick={() => !isUploading && inputRef.current?.click()}
          disabled={isUploading}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[#1A2551] bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors disabled:opacity-50"
        >
          {isUploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          {isUploading ? 'Uploading...' : label}
        </button>
      </div>
    );
  }

  return (
    <div className={cn('w-full', className)}>
      <div
        onClick={() => !isUploading && inputRef.current?.click()}
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
          multiple
          onChange={handleChange}
          className="hidden"
          disabled={isUploading}
        />
        {isUploading ? (
          <div className="space-y-2">
            <Loader2 className="w-10 h-10 mx-auto text-[#1A2551] animate-spin" />
            <p className="text-sm text-gray-600">Uploading images...</p>
          </div>
        ) : (
          <>
            <Upload className="w-10 h-10 mx-auto mb-3 text-gray-400" />
            <p className="text-sm font-medium text-gray-700 mb-1">Click or drag images to upload</p>
            <p className="text-xs text-gray-500">Multiple images supported • Auto-compression active</p>
          </>
        )}
      </div>
    </div>
  );
}
