// =====================================================
// DATABASE UTILITY FUNCTIONS
// =====================================================
// Supabase with localStorage fallback for development

import type { Property, PropertyWithDetails, Testimonial, BlogPost, ContactSubmission, ContactSubmissionWithProperty, StaticPage, TeamMember, Area } from '../types/database';
import type { Property as UIProperty } from '../types/property';
import { transformPropertyToUI } from './adapters';

// =====================================================
// SUPABASE CLIENT INITIALIZATION
// =====================================================

import { supabase } from './supabase/client';
import { get, set } from './kvStore';

// =====================================================
// SIMPLE QUERY CACHE
// =====================================================

const CACHE_PREFIX = 'bartlett_db_cache_v2_'; // Bumped version to invalidate old cache
const CACHE_TTL = 300000; // 5 minutes

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  version: string;
}

// Helper to get/set from persistent storage
function getPersistentCache<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(CACHE_PREFIX + key);
    if (!item) return null;

    // Check if it's the new format
    const parsed = JSON.parse(item) as CacheEntry<T>;

    // Enforce TTL
    const age = Date.now() - parsed.timestamp;
    if (age > CACHE_TTL) {
      console.log(`Cache expired for ${key} (age: ${age}ms > TTL: ${CACHE_TTL}ms)`);
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }

    return parsed.data;
  } catch (e) {
    console.warn('Cache parse error', e);
    return null;
  }
}

function setPersistentCache<T>(key: string, data: T): void {
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      version: 'v1'
    };
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
  } catch (e) {
    console.warn('Cache write error', e);
  }
}

// In-memory cache for ultra-fast access during session
const memoryCache = new Map<string, any>();

// =====================================================
// REQUEST DEDUPLICATION
// =====================================================
// Prevents duplicate simultaneous queries for the same data

const inflightRequests = new Map<string, Promise<any>>();

/**
 * Wraps a fetch function to prevent duplicate simultaneous requests.
 * If a request for the same key is already in-flight, returns the existing promise.
 */
async function withDeduplication<T>(
  key: string,
  fetcher: () => Promise<T>
): Promise<T> {
  // If there's already an in-flight request for this key, return it
  if (inflightRequests.has(key)) {
    console.log(`🔄 Dedup: Reusing in-flight request for ${key}`);
    return inflightRequests.get(key)! as Promise<T>;
  }

  // Create the promise and store it
  const promise = fetcher().finally(() => {
    // Clean up after request completes (success or failure)
    inflightRequests.delete(key);
  });

  inflightRequests.set(key, promise);
  return promise;
}

/**
 * Stale-while-revalidate caching pattern.
 * Returns cached data immediately if available, then revalidates in background.
 */
async function withStaleWhileRevalidate<T>(
  cacheKey: string,
  fetcher: () => Promise<T | null>,
  shortTTL: number = 30000 // 30 seconds default
): Promise<T | null> {
  const cached = getStored<T>(cacheKey);

  if (cached) {
    // Return stale data immediately, revalidate in background
    console.log(`⚡ SWR: Returning cached ${cacheKey}, revalidating in background`);

    // Background revalidation (non-blocking)
    setTimeout(async () => {
      try {
        const fresh = await fetcher();
        if (fresh) {
          setCache(cacheKey, fresh);
          console.log(`🔄 SWR: Background revalidation complete for ${cacheKey}`);
        }
      } catch (e) {
        console.warn(`SWR: Background revalidation failed for ${cacheKey}`, e);
      }
    }, 0);

    return cached;
  }

  // No cache, fetch fresh data
  const data = await fetcher();
  if (data) {
    setCache(cacheKey, data);
  }
  return data;
}

export function getStored<T>(key: string): T | null {
  // 1. Try memory
  if (memoryCache.has(key)) return memoryCache.get(key);

  // 2. Try persistence
  const persistent = getPersistentCache<T>(key);
  if (persistent) {
    memoryCache.set(key, persistent);
    return persistent;
  }

  return null;
}

function setCache<T>(key: string, data: T): void {
  memoryCache.set(key, data);
  setPersistentCache(key, data);
}

export function clearCache(): void {
  memoryCache.clear();
  try {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (e) {
    // Ignore
  }
}





// =====================================================
// PROPERTIES
// =====================================================

// Helper to sort properties: Status > Custom Order > Date
const sortProperties = <T extends { id: number; status: string; created_at?: string | null }>(properties: T[], orderIds: number[]): T[] => {
  const statusPriority: Record<string, number> = {
    'available': 0,
    'under_offer': 1,
    'sale-agreed': 2,
    'under-offer': 2, // Map both
    'sold': 3,
    'draft': 4
  };

  return [...properties].sort((a, b) => {
    // 1. Sort by Custom Order (PRIMARY)
    // If the user has manually reordered, this should take precedence
    const indexA = orderIds.indexOf(a.id);
    const indexB = orderIds.indexOf(b.id);

    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }

    // 2. Sort by Status (SECONDARY - for new items not in custom list)
    const statusA = statusPriority[a.status?.toLowerCase()] ?? 99;
    const statusB = statusPriority[b.status?.toLowerCase()] ?? 99;

    if (statusA !== statusB) {
      return statusA - statusB;
    }

    // 3. Sort by Date (TERTIARY - descending)
    return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
  });
};

export async function updatePropertyOrder(orderedIds: number[]): Promise<boolean> {
  return set('property_sort_order', orderedIds);
}

// Lightweight version for CMS list view - only fetches essential fields
export async function getAllPropertiesAdminLight(): Promise<Partial<Property>[]> {
  const cacheKey = 'properties_admin_light';
  const cached = getStored<Partial<Property>[]>(cacheKey);
  if (cached) {
    console.log('✅ Returning cached properties:', cached.length, 'properties');
    return cached;
  }

  console.log('🔍 Fetching properties from database...');
  const startTime = Date.now();

  const { data, error } = await supabase
    .from('properties')
    .select('id, title, slug, location, price, status, beds, baths, hero_image, thumbnail_image, meta_title, meta_description, created_at, updated_at')
    .order('created_at', { ascending: false })
    .limit(500); // Prevent timeout

  const duration = Date.now() - startTime;

  if (error) {
    console.error('❌ Error fetching properties (took ' + duration + 'ms):', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint
    });
    // Don't cache errors
    return [];
  }
  const properties = data || [];
  console.log('✅ Fetched', properties.length, 'properties from database in', duration, 'ms');

  // Apply custom sorting
  const orderIds = await get<number[]>('property_sort_order') || [];
  const sorted = sortProperties(properties, orderIds);

  // Cache results
  setCache(cacheKey, sorted);
  console.log('💾 Cached', sorted.length, 'properties');
  return sorted;
}

// Full data version - use only when editing
export async function getAllPropertiesAdmin(): Promise<Property[]> {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching properties:', error);
    return [];
  }
  const properties = data || [];

  // Apply custom sorting
  const orderIds = await get<number[]>('property_sort_order') || [];
  return sortProperties(properties, orderIds);
}

export async function getPublishedProperties(): Promise<UIProperty[]> {
  const cacheKey = 'properties_published_raw_v2';

  // Use request deduplication to prevent duplicate simultaneous fetches
  return withDeduplication(cacheKey, async () => {
    // 1. Get Raw Data (Cached)
    let properties: Property[] = getStored<Property[]>(cacheKey) || [];

    if (properties.length === 0) {
      console.log('🔍 Fetching published properties from database...');
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .in('status', ['available', 'under_offer', 'sold', 'sale-agreed', 'under-offer'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching published properties:', error);
        return [];
      }

      properties = data || [];

      if (properties.length > 0) {
        setCache(cacheKey, properties);
        console.log('💾 Cached', properties.length, 'raw published properties');
      }
    } else {
      console.log('✅ Used cached raw properties:', properties.length);
    }

    // 2. Get Sort Order (Fresh)
    const orderIds = await get<number[]>('property_sort_order') || [];

    // 3. Apply Sort & Transform
    const sortedProperties = sortProperties(properties, orderIds);
    return sortedProperties.map(transformPropertyToUI);
  });
}

export async function getPropertyBySlug(slug: string): Promise<PropertyWithDetails | null> {
  const cacheKey = `property_slug_${slug}`;

  // Use request deduplication + stale-while-revalidate for fast repeat visits
  return withDeduplication(cacheKey, () =>
    withStaleWhileRevalidate<PropertyWithDetails>(
      cacheKey,
      async () => {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('slug', slug)
          .maybeSingle();

        if (error) {
          console.error('Error fetching property:', error);
          return null;
        }
        return data;
      },
      30000 // 30 second TTL for property details
    )
  );
}

export async function getRelatedProperties(
  excludeId: number,
  limit = 3
): Promise<UIProperty[]> {
  const cacheKey = `related_properties_${excludeId}_${limit}`;
  const cached = getStored<UIProperty[]>(cacheKey);
  if (cached) {
    console.log(`✅ Cache hit: related properties for ID ${excludeId}`);
    return cached;
  }

  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('status', 'available')
      .neq('id', excludeId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching related properties:', error);
      return [];
    }

    const result = (data || [])
      .map(transformPropertyToUI)
      .sort((a, b) => b.priceValue - a.priceValue);
    if (result.length > 0) {
      setCache(cacheKey, result);
    }
    return result;
  } catch (error) {
    console.error('Error fetching related properties:', error);
    return [];
  }
}

export async function getFeaturedProperty(): Promise<Property | null> {
  const metaCacheKey = 'property_featured_v2';

  // Always fetch dynamic ID first
  try {
    const heroId = await get<number>('home_hero_id');

    if (heroId) {
      const cacheKey = `property_${heroId}`;
      const cached = getStored<Property>(cacheKey);
      if (cached) {
        // Update the meta-cache for HomeHero initialization
        setCache(metaCacheKey, cached);
        return cached;
      }

      const { data } = await supabase
        .from('properties')
        .select('*')
        .eq('id', heroId)
        .maybeSingle();

      if (data) {
        setCache(cacheKey, data);
        setCache(metaCacheKey, data); // Ensure HomeHero gets it too
        return data;
      }
    }

    // Fallback: Check for 'is_featured' flag if no specific hero set
    const { data } = await supabase
      .from('properties')
      .select('*')
      .eq('is_featured', true)
      .limit(1)
      .maybeSingle();

    if (data) setCache(metaCacheKey, data);
    return data;
  } catch (error) {
    console.error('Error fetching featured property:', error);
    return null;
  }
}

export async function getHomeFeaturedProperties(): Promise<UIProperty[]> {
  const cacheKey = 'home_featured_properties_v1';
  const cached = getStored<UIProperty[]>(cacheKey);
  if (cached) {
    console.log('✅ Cache hit: featured properties');
    return cached;
  }

  try {
    // Get IDs from settings
    const ids = await get<number[]>('home_featured_ids');

    if (ids && ids.length > 0) {
      // Fetch the featured properties
      const { data } = await supabase
        .from('properties')
        .select('*')
        .in('id', ids);

      if (data) {
        // Sort by the order in the IDs array
        const sortedData = [...data].sort((a, b) => {
          return ids.indexOf(a.id) - ids.indexOf(b.id);
        });

        const result = sortedData.map(transformPropertyToUI);
        if (result.length > 0) {
          setCache(cacheKey, result);
        }
        return result;
      }
    }

    // Fallback
    const result = await getPublishedProperties();
    const fallback = result.filter(p => p.status.toLowerCase() === 'available').slice(0, 3);
    if (fallback.length > 0) {
      setCache(cacheKey, fallback);
    }
    return fallback;

  } catch (error) {
    console.error('Error fetching home featured properties:', error);
    return [];
  }
}

export async function createProperty(property: Partial<Property>): Promise<Property | null> {
  // Supabase implementation
  const newProperty = {
    title: property.title || 'Untitled Property',
    slug: property.slug || `property-${Date.now()}`,
    price: property.price || '£0',
    status: property.status || 'available',
    property_type: property.property_type || 'Property',
    location: property.location || 'Kew',
    area: property.area || property.location || 'Kew',
    full_address: property.full_address || '',
    postcode: property.postcode || '',
    google_maps_url: property.google_maps_url || '',
    beds: property.beds || 0,
    baths: property.baths || 0,
    receptions: property.receptions || 0,
    sqft: property.sqft || 0,
    epc_rating: property.epc_rating || '',
    council_tax_band: property.council_tax_band || '',
    short_description: property.short_description || '',
    description: property.description || '',
    features: property.features || [],
    nearby_places: property.nearby_places || [],
    hero_image: property.hero_image || null,
    featured_images: property.featured_images || ['', '', '', ''],
    thumbnail_image: property.thumbnail_image || null,
    gallery_images: property.gallery_images || [],
    floor_plan_image: property.floor_plan_image || null,
    virtual_tour_url: property.virtual_tour_url || null,
    video_url: property.video_url || null,
    // SEO fields
    meta_title: property.meta_title || null,
    meta_description: property.meta_description || null,
    keywords: property.keywords || null,
    // Alt text fields for accessibility/SEO
    hero_image_alt: property.hero_image_alt || null,
    floor_plan_alt: property.floor_plan_alt || null,
    featured_images_alt: property.featured_images_alt || null,
    gallery_images_alt: property.gallery_images_alt || null,
    is_featured: property.is_featured || false
  };

  const { data, error } = await supabase
    .from('properties')
    .insert(newProperty)
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error creating property:', error);
    return null;
  }

  // Clear cache after creation
  clearCache();
  return data;
}

export async function updateProperty(id: number, updates: Partial<Property>): Promise<boolean> {
  // Price is always stored as string in database, no conversion needed

  // All fields including SEO are now persisted
  const { error } = await supabase
    .from('properties')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('Error updating property:', error);
    return false;
  }

  // Clear cache after update
  clearCache();
  return true;
}

export async function deleteProperty(id: number): Promise<boolean> {
  const { error } = await supabase
    .from('properties')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting property:', error);
    return false;
  }

  // Clear cache after deletion
  clearCache();
  return true;
}

// =====================================================
// TESTIMONIALS
// =====================================================

export async function getAllTestimonialsAdmin(): Promise<Testimonial[]> {
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching testimonials:', error);
    return [];
  }
  return data || [];
}

export async function getPublishedTestimonials(): Promise<Testimonial[]> {
  const cacheKey = 'testimonials_published_v1';
  const cached = getStored<Testimonial[]>(cacheKey);
  if (cached) {
    console.log('✅ Cache hit: testimonials');
    return cached;
  }

  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .eq('published', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching testimonials:', error);
    return [];
  }

  const result = data || [];
  if (result.length > 0) {
    setCache(cacheKey, result);
  }
  return result;
}

export async function createTestimonial(testimonial: Partial<Testimonial>): Promise<Testimonial | null> {
  const { data, error } = await supabase
    .from('testimonials')
    .insert({
      author: testimonial.author || '',
      role: testimonial.role || null,
      content: testimonial.content || '',
      rating: testimonial.rating || 5,
      avatar_url: testimonial.avatar_url || null,
      published: testimonial.published !== undefined ? testimonial.published : true,
      display_order: testimonial.display_order || 0
    })
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error creating testimonial:', error);
    return null;
  }
  return data;
}

export async function updateTestimonial(id: number, updates: Partial<Testimonial>): Promise<boolean> {
  const { error } = await supabase
    .from('testimonials')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('Error updating testimonial:', error);
    return false;
  }
  return true;
}

export async function deleteTestimonial(id: number): Promise<boolean> {
  const { error } = await supabase
    .from('testimonials')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting testimonial:', error);
    return false;
  }
  return true;
}

export async function reorderTestimonials(reorderedTestimonials: Testimonial[]): Promise<boolean> {
  try {
    const updates = reorderedTestimonials.map((t, index) => ({
      id: t.id,
      display_order: index,
      updated_at: new Date().toISOString()
    }));

    // Batch update using upsert for better performance
    const { error } = await supabase
      .from('testimonials')
      .upsert(updates, { onConflict: 'id' });

    if (error) {
      console.error('Error updating testimonial order:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error reordering testimonials:', error);
    return false;
  }
}

// =====================================================
// BLOG POSTS / INSIGHTS
// =====================================================

// Lightweight version for CMS list view - only fetches essential fields
export async function getAllBlogPostsAdminLight(): Promise<Partial<BlogPost>[]> {
  const cacheKey = 'blog_posts_admin_light';
  const cached = getStored<Partial<BlogPost>[]>(cacheKey);
  if (cached) {
    console.log('✅ Returning cached CMS blog posts:', cached.length, 'posts');
    return cached;
  }

  console.log('🔍 Fetching CMS blog posts from database...');
  console.warn('⚠️ SLOW QUERY WARNING: If this takes > 3 seconds, you need database indexes!');
  console.log('👉 See SUPABASE_TIMEOUT_FIX.md for SQL commands to add indexes');

  const startTime = Date.now();

  // Fetch essential fields for CMS list view
  const { data, error } = await supabase
    .from('blog_posts')
    .select('id, title, slug, excerpt, category, status, published_at, featured_image, author, created_at, updated_at')
    .order('published_at', { ascending: false, nullsFirst: false }) // Published posts newest first, drafts at end
    .limit(100); // Reduced limit for faster queries

  const duration = Date.now() - startTime;

  if (error) {
    console.error('❌ Error fetching CMS blog posts (took ' + duration + 'ms):', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint
    });

    if (error.code === '57014') {
      console.error('🔥 STATEMENT TIMEOUT - Your database queries are too slow!');
      console.error('🔧 SOLUTION: Add database indexes. See SUPABASE_TIMEOUT_FIX.md');
    }

    // Don't cache errors - return empty array but don't cache it
    return [];
  }

  const result = data || [];
  console.log('✅ Fetched', result.length, 'CMS blog posts from database in', duration, 'ms');

  if (duration > 3000) {
    console.warn('⚠️ SLOW QUERY: Took ' + duration + 'ms - ADD DATABASE INDEXES!');
  }

  // Cache results (even if empty for CMS, as empty is a valid state)
  setCache(cacheKey, result);
  console.log('💾 Cached', result.length, 'CMS blog posts');

  return result;
}

// Full data version - use only when editing
export async function getAllBlogPostsAdmin(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }
  return data || [];
}

// Lightweight version for list views - excludes content field
export async function getPublishedBlogPostsLight(): Promise<Partial<BlogPost>[]> {
  const cacheKey = 'blog_posts_published_light';
  const cached = getStored<Partial<BlogPost>[]>(cacheKey);
  if (cached) {
    console.log('✅ Returning cached blog posts:', cached.length, 'posts');
    return cached;
  }

  console.log('🔍 Fetching blog posts from database...');
  const startTime = Date.now();

  const { data, error } = await supabase
    .from('blog_posts')
    .select('id, title, slug, excerpt, category, status, published_at, featured_image, featured_image_alt, author, read_time, created_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(100); // Reasonable limit for front-end display

  const duration = Date.now() - startTime;

  if (error) {
    console.error('❌ Error fetching blog posts (took ' + duration + 'ms):', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint
    });
    // Don't cache errors - return empty array but don't cache it
    return [];
  }

  const result = data || [];
  console.log('✅ Fetched', result.length, 'blog posts from database in', duration, 'ms');

  // Only cache if we got results (don't cache empty arrays)
  if (result.length > 0) {
    setCache(cacheKey, result);
    console.log('💾 Cached', result.length, 'blog posts');
  } else {
    console.warn('⚠️ No blog posts found - not caching empty result');
  }

  return result;
}

export async function getPublishedBlogPosts(): Promise<BlogPost[]> {
  const cacheKey = 'blog_posts_published';
  const cached = getStored<BlogPost[]>(cacheKey);
  if (cached) return cached;

  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }

  const result = data || [];
  setCache(cacheKey, result);
  return result;
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }
  return data;
}

export async function createBlogPost(post: Partial<BlogPost>): Promise<BlogPost | null> {
  // Build the insert payload
  const insertPayload = {
    title: post.title || 'Untitled Post',
    slug: post.slug || `post-${Date.now()}`,
    excerpt: post.excerpt || '',
    content: post.content || '',
    author: post.author || 'Bartlett & Partners',
    featured_image: post.featured_image || null,
    featured_image_alt: post.featured_image_alt || null,
    category: post.category || 'Market Updates',
    status: post.status || 'draft',
    published_at: post.published_at || null,
    view_count: post.view_count || 0,
    read_time: post.read_time || 5,
    meta_title: post.meta_title || null,
    meta_description: post.meta_description || null,
    keywords: post.keywords || null,
    noindex: post.noindex || false,
    nofollow: post.nofollow || false,
    sitemap_enabled: post.sitemap_enabled !== undefined ? post.sitemap_enabled : true
  };

  // Log what we're sending
  console.log('📤 Creating blog post with payload:', {
    title: insertPayload.title,
    slug: insertPayload.slug,
    excerpt: insertPayload.excerpt?.substring(0, 50) + (insertPayload.excerpt && insertPayload.excerpt.length > 50 ? '...' : ''),
    category: insertPayload.category,
    status: insertPayload.status,
    author: insertPayload.author,
    contentLength: insertPayload.content?.length || 0,
    published_at: insertPayload.published_at
  });

  const { data, error } = await supabase
    .from('blog_posts')
    .insert(insertPayload)
    .select()
    .maybeSingle();

  if (error) {
    console.error('❌ Error creating blog post:', error);
    console.error('❌ Error details:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    });
    return null;
  }

  // Log what we received back
  if (data) {
    console.log('📥 Received from database:', {
      id: data.id,
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt?.substring(0, 50) + (data.excerpt && data.excerpt.length > 50 ? '...' : ''),
      category: data.category,
      status: data.status,
      author: data.author,
      contentLength: data.content?.length || 0,
      published_at: data.published_at
    });

    // Check for mismatches
    const mismatches: string[] = [];
    if (data.title !== insertPayload.title) mismatches.push(`title: sent "${insertPayload.title}" got "${data.title}"`);
    if (data.slug !== insertPayload.slug) mismatches.push(`slug: sent "${insertPayload.slug}" got "${data.slug}"`);
    if (data.excerpt !== insertPayload.excerpt) mismatches.push(`excerpt mismatch`);
    if (data.category !== insertPayload.category) mismatches.push(`category: sent "${insertPayload.category}" got "${data.category}"`);
    if (data.status !== insertPayload.status) mismatches.push(`status: sent "${insertPayload.status}" got "${data.status}"`);
    if (data.author !== insertPayload.author) mismatches.push(`author: sent "${insertPayload.author}" got "${data.author}"`);

    if (mismatches.length > 0) {
      console.warn('⚠️ DATA MISMATCH between sent and received:', mismatches);
    } else {
      console.log('✅ Data saved correctly - no mismatches detected');
    }
  } else {
    console.warn('⚠️ Insert succeeded but no data returned');
  }

  // Clear cache after creation
  clearCache();
  return data;
}

export async function updateBlogPost(id: number, updates: Partial<BlogPost>): Promise<boolean> {
  // Explicitly map only valid database fields
  const validUpdates = {
    ...(updates.title !== undefined && { title: updates.title }),
    ...(updates.slug !== undefined && { slug: updates.slug }),
    ...(updates.excerpt !== undefined && { excerpt: updates.excerpt }),
    ...(updates.content !== undefined && { content: updates.content }),
    ...(updates.author !== undefined && { author: updates.author }),
    ...(updates.category !== undefined && { category: updates.category }),
    ...(updates.featured_image !== undefined && { featured_image: updates.featured_image }),
    ...(updates.featured_image_alt !== undefined && { featured_image_alt: updates.featured_image_alt }),
    ...(updates.read_time !== undefined && { read_time: updates.read_time }),
    ...(updates.meta_title !== undefined && { meta_title: updates.meta_title }),
    ...(updates.meta_description !== undefined && { meta_description: updates.meta_description }),
    ...(updates.keywords !== undefined && { keywords: updates.keywords }),
    ...(updates.noindex !== undefined && { noindex: updates.noindex }),
    ...(updates.nofollow !== undefined && { nofollow: updates.nofollow }),
    ...(updates.sitemap_enabled !== undefined && { sitemap_enabled: updates.sitemap_enabled }),
    ...(updates.status !== undefined && { status: updates.status }),
    ...(updates.published_at !== undefined && { published_at: updates.published_at }),
    ...(updates.view_count !== undefined && { view_count: updates.view_count }),
    updated_at: new Date().toISOString()
  };

  const { error } = await supabase
    .from('blog_posts')
    .update(validUpdates)
    .eq('id', id);

  if (error) {
    console.error('❌ Error updating blog post:', error);
    return false;
  }

  console.log('✅ Blog post updated successfully');
  // Clear cache after update
  clearCache();
  return true;
}

export async function deleteBlogPost(id: number): Promise<boolean> {
  const { error } = await supabase
    .from('blog_posts')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting blog post:', error);
    return false;
  }

  // Clear cache after deletion
  clearCache();
  return true;
}

// =====================================================
// CONTACT SUBMISSIONS / INQUIRIES
// =====================================================

export async function getAllContactSubmissions(): Promise<ContactSubmissionWithProperty[]> {
  const { data, error } = await supabase
    .from('enquiries')
    .select(`
      *,
      property:properties(id, title, slug)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching enquiries:', error);
    return [];
  }

  // Transform to match ContactSubmissionWithProperty type
  return (data || []).map((item: any) => ({
    ...item,
    property: item.property ? {
      id: item.property.id,
      title: item.property.title,
      slug: item.property.slug
    } : undefined
  }));
}

export const getContactSubmissions = getAllContactSubmissions;

export async function createContactSubmission(submission: Partial<ContactSubmission>): Promise<number | null> {
  const { data, error } = await supabase
    .from('enquiries')
    .insert({
      name: submission.name || '',
      email: submission.email || '',
      phone: submission.phone || null,
      message: submission.message || '',
      property_id: submission.property_id || null,
      property_title: submission.property_title || null,
      inquiry_type: submission.inquiry_type || 'general',
      seller_postcode: submission.seller_postcode || null,
      seller_house_number: submission.seller_house_number || null,
      status: 'new'
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error creating contact submission:', error);
    return null;
  }
  return data?.id || null;
}

export async function submitContactForm(formData: {
  name: string;
  email: string;
  phone?: string;
  message: string;
  property_id?: string | number;
  propertyId?: number;
  propertyTitle?: string;
  inquiry_type?: 'general' | 'property' | 'valuation' | 'newsletter';
  seller_postcode?: string;
  seller_house_number?: string;
}): Promise<number | null> {
  // Handle both property_id and propertyId
  const propertyId = formData.property_id || formData.propertyId;

  return createContactSubmission({
    name: formData.name,
    email: formData.email,
    phone: formData.phone || null,
    message: formData.message,
    property_id: propertyId ? (typeof propertyId === 'string' ? parseInt(propertyId) : propertyId) : null,
    property_title: formData.propertyTitle || null,
    inquiry_type: formData.inquiry_type || 'general',
    seller_postcode: formData.seller_postcode || null,
    seller_house_number: formData.seller_house_number || null,
  });
}

export async function updateEnquiryById(id: number, updates: {
  phone?: string;
  message?: string;
  address?: string;
  price_range?: string;
  min_beds?: string;
  timeline?: string;
}): Promise<boolean> {
  const { error } = await supabase
    .from('enquiries')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating enquiry:', error);
    return false;
  }
  return true;
}

export async function updateContactSubmissionStatus(id: number, status: string): Promise<boolean> {
  const { error } = await supabase
    .from('enquiries')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('Error updating contact submission status:', error);
    return false;
  }
  return true;
}

export async function deleteContactSubmission(id: number): Promise<boolean> {
  const { error } = await supabase
    .from('enquiries')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting contact submission:', error);
    return false;
  }
  return true;
}

// =====================================================
// GLOBAL SETTINGS
// =====================================================

export async function getGlobalSettings<T = any>(key: string): Promise<T | null> {
  const { data, error } = await supabase
    .from('global_settings')
    .select('setting_value')
    .eq('setting_key', key)
    .maybeSingle();

  if (error) {
    console.error('Error fetching global setting:', error);
    return null;
  }
  return data?.setting_value || null;
}

export async function setGlobalSettings(key: string, value: any): Promise<boolean> {
  const { error } = await supabase
    .from('global_settings')
    .upsert({
      setting_key: key,
      setting_value: value,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'setting_key'
    });

  if (error) {
    console.error(`Error setting global setting ${key}:`, error);
    return false;
  }
  return true;
}

// =====================================================
// NEWSLETTER SUBSCRIBERS
// =====================================================

export async function saveSubscriber(email: string): Promise<boolean> {
  try {
    const subscribers = await getGlobalSettings('newsletter_subscribers') || [];

    if (subscribers.includes(email)) {
      console.log('Email already subscribed:', email);
      return true;
    }

    subscribers.push(email);
    return await setGlobalSettings('newsletter_subscribers', subscribers);
  } catch (error) {
    console.error('Error in saveSubscriber:', error);
    return false;
  }
}

// =====================================================
// STATIC PAGES (For SEO Management)
// =====================================================

export async function getAllStaticPages(): Promise<StaticPage[]> {
  const { data, error } = await supabase
    .from('static_pages')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching static pages:', error);
    return [];
  }
  return data || [];
}

export async function getStaticPageBySlug(slug: string): Promise<StaticPage | null> {
  const { data, error } = await supabase
    .from('static_pages')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    console.error('Error fetching static page:', error);
    return null;
  }
  return data;
}

export async function getStaticPageByName(name: string): Promise<StaticPage | null> {
  const { data, error } = await supabase
    .from('static_pages')
    .select('*')
    .ilike('name', name)
    .maybeSingle();

  if (error) {
    console.error('Error fetching static page by name:', error);
    return null;
  }
  return data;
}

export async function updateStaticPage(originalSlug: string, updates: Partial<StaticPage>): Promise<boolean> {
  const { error } = await supabase
    .from('static_pages')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('slug', originalSlug);

  if (error) {
    console.error('Error in updateStaticPage:', error);
    return false;
  }

  // Clear cache after update to ensure SEO changes are reflected immediately
  clearCache();
  console.log('✅ Static page updated, cache cleared');
  return true;
}

export async function createStaticPage(page: Partial<StaticPage>): Promise<StaticPage | null> {
  const { data, error } = await supabase
    .from('static_pages')
    .insert({
      name: page.name || '',
      slug: page.slug || '',
      meta_title: page.meta_title || null,
      meta_description: page.meta_description || null,
      keywords: page.keywords || null,
      og_image: page.og_image || null,
      noindex: page.noindex || false,
      nofollow: page.nofollow || false,
      sitemap_enabled: page.sitemap_enabled !== undefined ? page.sitemap_enabled : true,
      status: page.status || 'draft',
      page_group: page.page_group || null
    })
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error in createStaticPage:', error);
    return null;
  }

  // Clear cache after creation
  clearCache();
  return data;
}

// =====================================================
// TEAM MEMBERS
// =====================================================

export async function getTeamMembers(): Promise<TeamMember[]> {
  const cacheKey = 'team_members_active';
  const cached = getStored<TeamMember[]>(cacheKey);
  if (cached) return cached;

  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('status', 'active')
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching team members:', error);
    return [];
  }

  const result = data || [];
  setCache(cacheKey, result);
  return result;
}

export async function getAllTeamMembersAdmin(): Promise<TeamMember[]> {
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching team members:', error);
    return [];
  }
  return data || [];
}

export async function upsertTeamMember(member: Partial<TeamMember>): Promise<TeamMember | null> {
  const payload = {
    ...member,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('team_members')
    .upsert(payload)
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error upserting team member:', error);
    return null;
  }

  clearCache();
  return data;
}

export async function deleteTeamMember(id: number): Promise<boolean> {
  const { error } = await supabase
    .from('team_members')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting team member:', error);
    return false;
  }

  clearCache();
  return true;
}

export async function reorderTeamMembers(members: TeamMember[]): Promise<boolean> {
  try {
    const updates = members.map((m, index) => ({
      id: m.id,
      display_order: index,
      updated_at: new Date().toISOString()
    }));

    const { error } = await supabase
      .from('team_members')
      .upsert(updates, { onConflict: 'id' });

    if (error) {
      console.error('Error reordering team members:', error);
      return false;
    }

    clearCache();
    return true;
  } catch (error) {
    console.error('Error reordering team members:', error);
    return false;
  }
}

// =====================================================
// AREAS (Location filtering)
// =====================================================

export async function getEnabledAreas(): Promise<Area[]> {
  const cacheKey = 'areas_enabled';

  return withDeduplication(cacheKey, async () => {
    const cached = getStored<Area[]>(cacheKey);
    if (cached) {
      console.log('✅ Cache hit: enabled areas');
      return cached;
    }

    const { data, error } = await supabase
      .from('areas')
      .select('*')
      .eq('enabled', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching areas:', error);
      return [];
    }

    const result = data || [];
    if (result.length > 0) {
      setCache(cacheKey, result);
    }
    return result;
  });
}

/**
 * Get distinct locations that have available properties.
 * Used for nav dropdowns to only show areas with active listings.
 */
export async function getAreasWithAvailableProperties(): Promise<string[]> {
  const cacheKey = 'areas_with_available';

  return withDeduplication(cacheKey, async () => {
    const cached = getStored<string[]>(cacheKey);
    if (cached) {
      console.log('✅ Cache hit: areas with available properties');
      return cached;
    }

    const { data, error } = await supabase
      .from('properties')
      .select('location')
      .eq('status', 'available')
      .not('location', 'is', null);

    if (error) {
      console.error('Error fetching areas with available properties:', error);
      return [];
    }

    // Get unique locations and sort with Twickenham and Teddington first
    const uniqueLocations = [...new Set(data.map(p => p.location as string))].filter(Boolean);

    // Priority areas - Twickenham first, then Teddington
    const priorityAreas = ['Twickenham', 'Teddington'];

    const locations = uniqueLocations.sort((a, b) => {
      const aIndex = priorityAreas.indexOf(a);
      const bIndex = priorityAreas.indexOf(b);

      // Both are priority areas - sort by priority order
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      // Only a is priority - a comes first
      if (aIndex !== -1) return -1;
      // Only b is priority - b comes first
      if (bIndex !== -1) return 1;
      // Neither is priority - sort alphabetically
      return a.localeCompare(b);
    });

    if (locations.length > 0) {
      setCache(cacheKey, locations);
    }
    return locations;
  });
}