import { useState, useRef, useEffect, useMemo } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  fetchPriority?: 'high' | 'low' | 'auto';
  /** Enable LQIP blur-up effect */
  enableLQIP?: boolean;
  /** Aspect ratio for placeholder (e.g., "4/3", "16/9") */
  aspectRatio?: string;
}

/**
 * Generate optimized URL for different image providers
 * Supports Supabase Storage (Pro plan) and Unsplash image transformations
 */
export function getOptimizedUrl(url: string, width: number, quality: number = 75, format: 'webp' | 'jpeg' = 'webp'): string {
  if (!url) return '';

  // Handle Supabase Storage URLs - Use render/image endpoint for on-the-fly transformations
  // Available on Pro plan and above: https://supabase.com/docs/guides/storage/serving/image-transformations
  if (url.includes('supabase.co') && url.includes('/storage/v1/object/public/')) {
    // Transform: /object/public/ -> /render/image/public/
    const transformedUrl = url.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/');
    // Supabase auto-serves WebP when browser supports it, no format param needed
    // resize=contain scales image to fit width while maintaining aspect ratio (no cropping)
    return `${transformedUrl}?width=${width}&quality=${quality}&resize=contain`;
  }

  // Handle Unsplash URLs (existing logic)
  if (url.includes('unsplash')) {
    const baseUrl = url.split('?')[0];
    return `${baseUrl}?w=${width}&q=${quality}&fm=${format}&fit=crop&auto=format`;
  }

  return url;
}

/**
 * Generate LQIP (Low Quality Image Placeholder) URL
 * Returns a tiny, heavily compressed version for blur-up effect
 */
function getLQIPUrl(url: string): string | undefined {
  if (!url) return undefined;

  // Unsplash: Use tiny width with blur
  if (url.includes('unsplash')) {
    const baseUrl = url.split('?')[0];
    return `${baseUrl}?w=20&q=20&blur=10&fm=webp`;
  }

  // Supabase: Use render/image endpoint with tiny dimensions for LQIP
  if (url.includes('supabase.co') && url.includes('/storage/v1/object/public/')) {
    const transformedUrl = url.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/');
    return `${transformedUrl}?width=20&quality=20&resize=contain`;
  }

  return undefined;
}

/**
 * OptimizedImage Component
 *
 * Features:
 * - Lazy loading with IntersectionObserver
 * - LQIP (Low Quality Image Placeholder) blur-up effect
 * - Responsive srcset for optimal loading
 * - Smooth fade transitions
 * - Skeleton placeholder for non-LQIP images
 */
export function OptimizedImage({
  src,
  alt,
  className = '',
  width,
  height,
  priority = false,
  fetchPriority = 'auto',
  enableLQIP = true,
  aspectRatio,
}: OptimizedImageProps) {
  const [loadState, setLoadState] = useState<'idle' | 'lqip' | 'loaded'>('idle');
  const [isInView, setIsInView] = useState(priority);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Memoize LQIP URL
  const lqipUrl = useMemo(() => {
    if (!enableLQIP || !src) return undefined;
    return getLQIPUrl(src);
  }, [src, enableLQIP]);

  const hasLQIP = Boolean(lqipUrl);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' } // Start loading 100px before visible
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  // Load LQIP first, then full image
  useEffect(() => {
    if (!isInView || !src) return;

    // If we have LQIP, load it first
    if (hasLQIP && lqipUrl && loadState === 'idle') {
      const lqipImg = new Image();
      lqipImg.src = lqipUrl;
      lqipImg.onload = () => setLoadState('lqip');
    }
  }, [isInView, src, hasLQIP, lqipUrl, loadState]);

  // Check for already-loaded images (from browser cache)
  // This handles the case where onLoad fires before React attaches the handler
  useEffect(() => {
    if (isInView && imgRef.current?.complete && imgRef.current?.naturalHeight > 0 && loadState !== 'loaded') {
      setLoadState('loaded');
    }
  }, [isInView, src, loadState]);

  // Generate srcset for responsive images
  const generateSrcSet = (url: string) => {
    if (!url) return undefined;

    // Supabase Storage: Generate responsive srcset with render/image endpoint
    // Using width-only to maintain aspect ratio (no cropping)
    if (url.includes('supabase.co') && url.includes('/storage/v1/object/public/')) {
      const transformedUrl = url.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/');
      return `${transformedUrl}?width=400&quality=70&resize=contain 400w, ${transformedUrl}?width=800&quality=75&resize=contain 800w, ${transformedUrl}?width=1200&quality=75&resize=contain 1200w, ${transformedUrl}?width=1600&quality=80&resize=contain 1600w`;
    }

    // Unsplash
    if (url.includes('unsplash')) {
      const baseUrl = url.split('?')[0];
      return `${baseUrl}?w=400&q=70&fm=webp&fit=crop&auto=format 400w, ${baseUrl}?w=800&q=75&fm=webp&fit=crop&auto=format 800w, ${baseUrl}?w=1200&q=75&fm=webp&fit=crop&auto=format 1200w, ${baseUrl}?w=1600&q=80&fm=webp&fit=crop&auto=format 1600w`;
    }

    return undefined;
  };

  const handleFullImageLoad = () => {
    setLoadState('loaded');
  };

  const isFullyLoaded = loadState === 'loaded';
  const showLQIP = hasLQIP && loadState !== 'loaded' && isInView;

  // Calculate aspect ratio style
  const aspectStyle = aspectRatio ? { aspectRatio } : undefined;

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={aspectStyle}
    >
      {/* Skeleton placeholder (shown when no LQIP or before LQIP loads) */}
      {!isFullyLoaded && (
        <div
          className={`absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 transition-opacity duration-500 ${loadState !== 'idle' ? 'opacity-0' : 'opacity-100'
            }`}
          aria-hidden="true"
        >
          {/* Animated shimmer effect */}
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
        </div>
      )}

      {/* LQIP blur placeholder */}
      {showLQIP && lqipUrl && (
        <img
          src={lqipUrl}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover blur-lg scale-105 transition-opacity duration-500"
          style={{ opacity: loadState === 'lqip' && !isFullyLoaded ? 1 : 0 }}
        />
      )}

      {/* Full resolution image */}
      {isInView && (
        <img
          ref={imgRef}
          src={getOptimizedUrl(src, width || 800, 75)}
          srcSet={generateSrcSet(src)}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          alt={alt}
          width={width || 800}
          height={height || 600}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : fetchPriority}
          decoding="async"
          onLoad={handleFullImageLoad}
          onError={() => {
            // Log error for debugging - image transformation failed
            console.error('Image failed to load:', src);
          }}
          className={`w-full h-full object-cover transition-all duration-700 ease-out ${isFullyLoaded
            ? 'opacity-100 blur-0 scale-100'
            : 'opacity-0 blur-sm scale-[1.02]'
            }`}
        />
      )}
    </div>
  );
}
