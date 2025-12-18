import { useState, useEffect } from 'react';
import { get } from '../utils/kvStore';

interface ImageBlock {
  id: string;
  label: string;
  value: string;
  description: string;
  fallback?: string;
  alt?: string;
}

type ImageSection = 'branding' | 'home' | 'about' | 'contact' | 'properties' | 'insights' | 'footer' | 'team' | 'locations' | 'film';

// Cache for loaded images
let imageCache: Record<string, Record<string, ImageBlock>> | null = null;
let cachePromise: Promise<void> | null = null;
const KV_KEY = 'site_images';
const STORAGE_Key = `bartlett_kv_${KV_KEY}`;

// Synchronous helper to load from local storage
function loadFromStorage(): Record<ImageSection, ImageBlock[]> | null {
  try {
    const item = localStorage.getItem(STORAGE_Key);
    return item ? JSON.parse(item) : null;
  } catch (e) {
    return null;
  }
}

// Initialize cache from storage immediately if logical
if (!imageCache && typeof window !== 'undefined') {
  const data = loadFromStorage();
  if (data) {
    imageCache = {};
    Object.entries(data).forEach(([section, blocks]) => {
      // @ts-ignore
      imageCache![section] = {};
      // @ts-ignore
      blocks.forEach((block: ImageBlock) => {
        // @ts-ignore
        imageCache![section][block.id] = block;
      });
    });
  }
}

async function loadImageCache(): Promise<void> {
  if (cachePromise) {
    await cachePromise;
    return;
  }

  cachePromise = (async () => {
    try {
      const data = await get<Record<ImageSection, ImageBlock[]>>(KV_KEY);
      if (data) {
        // Update in-memory cache
        const newCache: any = {};
        Object.entries(data).forEach(([section, blocks]) => {
          newCache[section] = {};
          blocks.forEach(block => {
            newCache[section][block.id] = block;
          });
        });
        imageCache = newCache;
      }
    } catch (error) {
      console.error('Failed to load site images:', error);
      if (!imageCache) imageCache = {};
    }
  })();

  await cachePromise;
}

/**
 * Hook to get a site image by its ID
 * @param imageId - The unique ID of the image (e.g., 'brand_logo_dark', 'h_film_bg')
 * @param fallback - Optional fallback URL if image not found
 * @returns The image URL and loading state
 */
export function useSiteImage(imageId: string, fallback?: string): { src: string; alt: string; isLoading: boolean } {
  // Initialize state SYNCHRONOUSLY from cache or local storage
  const [state, setState] = useState(() => {
    // 1. Check memory cache first
    if (imageCache) {
      for (const section of Object.values(imageCache)) {
        if (section[imageId]) {
          const block = section[imageId];
          return {
            src: block.value || block.fallback || fallback || '',
            alt: block.alt || block.label || '',
            isLoading: false
          };
        }
      }
    }

    // 2. Check local storage if memory cache missed (double check for safety)
    if (typeof window !== 'undefined') {
      const storedData = loadFromStorage();
      if (storedData) {
        for (const section of Object.values(storedData)) {
          // @ts-ignore
          const blocks = section as ImageBlock[];
          const block = blocks.find((b: ImageBlock) => b.id === imageId);
          if (block) {
            return {
              src: block.value || block.fallback || fallback || '',
              alt: block.alt || block.label || '',
              isLoading: false
            };
          }
        }
      }
    }

    // 3. Fallback
    return {
      src: fallback || '',
      alt: '',
      isLoading: true
    };
  });

  useEffect(() => {
    let mounted = true;

    async function revalidate() {
      // Always try to fetch fresh data
      await loadImageCache();

      if (!mounted) return;

      if (imageCache) {
        for (const section of Object.values(imageCache)) {
          if (section[imageId]) {
            const block = section[imageId];
            const newSrc = block.value || block.fallback || fallback || '';
            const newAlt = block.alt || block.label || '';

            // Only update if changed or if we were loading
            setState(prev => {
              if (prev.src !== newSrc || prev.alt !== newAlt || prev.isLoading) {
                return { src: newSrc, alt: newAlt, isLoading: false };
              }
              return prev;
            });
            return;
          }
        }
      }

      // If we finished loading and still found nothing, ensure loading is falsy
      setState(prev => prev.isLoading ? { ...prev, isLoading: false } : prev);
    }

    revalidate();

    return () => {
      mounted = false;
    };
  }, [imageId, fallback]);

  return state;
}

/**
 * Get a site image synchronously (returns fallback while loading)
 * Useful for components that don't need loading state
 */
export function getSiteImageUrl(imageId: string, fallback: string = ''): string {
  // Try memory cache first
  if (imageCache) {
    for (const section of Object.values(imageCache)) {
      if (section[imageId]) {
        return section[imageId].value || section[imageId].fallback || fallback;
      }
    }
    return fallback;
  }

  // Try local storage synchronously
  if (typeof window !== 'undefined') {
    const storedData = loadFromStorage();
    if (storedData) {
      for (const section of Object.values(storedData)) {
        // @ts-ignore
        const blocks = section as ImageBlock[];
        const block = blocks.find((b: ImageBlock) => b.id === imageId);
        if (block) {
          return block.value || block.fallback || fallback;
        }
      }
    }
  }

  // Trigger load in background
  loadImageCache();
  return fallback;
}

/**
 * Clear the image cache (call after updating images in CMS)
 */
export function clearSiteImageCache(): void {
  imageCache = null;
  cachePromise = null;
}
