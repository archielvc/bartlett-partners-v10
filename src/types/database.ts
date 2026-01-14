// =====================================================
// DATABASE TYPES - Production Schema
// =====================================================

export interface Property {
  id: number;
  title: string;
  slug: string;
  price: string;
  status: string;
  property_type: string;
  location: string;
  area: string | null;
  full_address: string | null;
  postcode: string | null;
  google_maps_url: string | null;
  beds: number;
  baths: number;
  receptions: number | null;
  sqft: number;
  epc_rating: string | null;
  council_tax_band: string | null;
  short_description: string | null;
  description: string | null;
  features: string[] | null; // JSONB array
  nearby_places: any[] | null; // JSONB array
  hero_image: string | null;
  featured_images: string[] | null; // Exactly 4 featured images
  thumbnail_image: string | null;
  gallery_images: string[] | null; // JSONB array
  floor_plan_image: string | null;
  virtual_tour_url: string | null;
  video_url: string | null;
  video_is_portrait: boolean | null;
  meta_title: string | null;
  meta_description: string | null;
  keywords: string[] | null; // SEO keywords
  noindex: boolean | null;
  nofollow: boolean | null;
  sitemap_enabled: boolean | null;

  // Alt text fields (auto-generated)
  hero_image_alt: string | null;
  floor_plan_alt: string | null;
  featured_images_alt: string[] | null;
  gallery_images_alt: string[] | null;

  is_featured?: boolean; // Controls home hero display

  created_at: string;
  updated_at: string;
}

export interface PropertyWithDetails extends Property {
  // Can add joined data here if needed
}

export interface Testimonial {
  id: number | string;
  author: string;
  role: string | null;
  content: string;
  rating: number;
  avatar_url: string | null;
  published: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  tldr: string | null;
  content: string;
  author: string;
  category: string;
  featured_image: string | null;
  featured_image_alt: string | null;
  read_time: number;
  meta_title: string | null;
  meta_description: string | null;
  keywords: string | null;
  noindex: boolean;
  nofollow: boolean;
  sitemap_enabled: boolean;
  status: 'draft' | 'published';
  published_at: string | null;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface ContactSubmission {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  property_title: string | null;
  property_id: number | null;
  message: string;
  inquiry_type?: 'general' | 'property' | 'valuation' | 'newsletter';
  status: string;
  notes: string | null;
  // Newsletter preference fields
  address: string | null;
  price_range: string | null;
  min_beds: string | null;
  timeline: string | null;
  // Seller property fields (for valuation enquiries)
  seller_postcode: string | null;
  seller_house_number: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContactSubmissionWithProperty extends ContactSubmission {
  property?: Property | null;
}

export interface TeamMember {
  id: number;
  name: string;
  role: string;
  bio: string | null;
  email: string | null;
  phone: string | null;
  image: string | null;
  linkedin_url: string | null;
  display_order: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface SEOSetting {
  id: number;
  page_path: string;
  meta_title: string | null;
  meta_description: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  keywords: string[] | null;
  canonical_url: string | null;
  noindex: boolean;
  created_at: string;
  updated_at: string;
}

export interface StaticPage {
  id: number;
  name: string;
  slug: string;
  meta_title: string | null;
  meta_description: string | null;
  keywords: string | null;
  og_image: string | null;
  noindex: boolean;
  nofollow: boolean;
  sitemap_enabled: boolean;
  status: 'published' | 'draft';
  page_group: string | null;
  updated_at: string;
  created_at: string;
}

export interface Area {
  id: number;
  name: string;
  display_order: number;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface GlobalSetting {
  id: number;
  setting_key: string;
  setting_value: any; // JSONB
  created_at: string;
  updated_at: string;
}