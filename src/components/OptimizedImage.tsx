import { useState, useRef, useEffect } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

export function getOptimizedUrl(url: string, width: number, quality: number = 80, format: 'webp' | 'jpeg' = 'webp'): string {
  if (!url) return '';

  // Handle Supabase Storage URLs
  // Note: Image Transformation (/render/image/) requires Supabase Pro plan
  // On free tier, return original URL to avoid broken images
  if (url.includes('supabase.co') && url.includes('/storage/v1/object/public/')) {
    // Return original URL - images are already optimized on upload
    return url;
  }

  // Handle Unsplash URLs (existing logic)
  if (url.includes('unsplash')) {
    const baseUrl = url.split('?')[0];
    return `${baseUrl}?w=${width}&q=${quality}&fm=${format}`;
  }

  return url;
}

export function OptimizedImage({
  src,
  alt,
  className = '',
  width,
  height,
  priority = false
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (priority) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '50px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  // Generate srcset for responsive images
  const generateSrcSet = (url: string) => {
    if (!url || url.includes('unsplash')) {
      // Unsplash supports dynamic sizing
      const baseUrl = url.split('?')[0];
      return `${baseUrl}?w=400&q=75 400w, ${baseUrl}?w=800&q=80 800w, ${baseUrl}?w=1200&q=80 1200w, ${baseUrl}?w=1600&q=85 1600w`;
    }
    return undefined;
  };

  return (
    <img
      ref={imgRef}
      src={isInView ? src : undefined}
      srcSet={isInView ? generateSrcSet(src) : undefined}
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      alt={alt}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      onLoad={() => setIsLoaded(true)}
      className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
    />
  );
}
