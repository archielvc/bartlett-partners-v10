-- =====================================================
-- Bartlett & Partners - Production Database Schema
-- =====================================================
-- This schema matches the TypeScript types in /types/database.ts
-- Run this in Supabase SQL Editor

-- =====================================================
-- PROPERTIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS properties (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  price TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'available',
  property_type TEXT NOT NULL,
  location TEXT NOT NULL,
  area TEXT,
  full_address TEXT,
  postcode TEXT,
  google_maps_url TEXT,
  beds INTEGER NOT NULL DEFAULT 0,
  baths INTEGER NOT NULL DEFAULT 0,
  receptions INTEGER DEFAULT 0,
  sqft INTEGER NOT NULL DEFAULT 0,
  epc_rating TEXT,
  council_tax_band TEXT,
  short_description TEXT,
  description TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  nearby_places JSONB DEFAULT '[]'::jsonb,
  hero_image TEXT,
  featured_images JSONB DEFAULT '["","","",""]'::jsonb,
  thumbnail_image TEXT,
  gallery_images JSONB DEFAULT '[]'::jsonb,
  floor_plan_image TEXT,
  virtual_tour_url TEXT,
  video_url TEXT,
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for properties
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_slug ON properties(slug);
CREATE INDEX IF NOT EXISTS idx_properties_location ON properties(location);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON properties(created_at DESC);

-- =====================================================
-- BLOG POSTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS blog_posts (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  author TEXT NOT NULL DEFAULT 'Bartlett & Partners',
  category TEXT NOT NULL DEFAULT 'Market Updates',
  featured_image TEXT,
  read_time INTEGER DEFAULT 5,
  view_count INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for blog_posts
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON blog_posts(created_at DESC);

-- =====================================================
-- TESTIMONIALS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS testimonials (
  id BIGSERIAL PRIMARY KEY,
  author TEXT NOT NULL,
  role TEXT,
  content TEXT NOT NULL,
  rating INTEGER NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  avatar_url TEXT,
  published BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for testimonials
CREATE INDEX IF NOT EXISTS idx_testimonials_published ON testimonials(published);
CREATE INDEX IF NOT EXISTS idx_testimonials_display_order ON testimonials(display_order);

-- =====================================================
-- ENQUIRIES TABLE (Contact Submissions)
-- =====================================================
CREATE TABLE IF NOT EXISTS enquiries (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  property_title TEXT,
  property_id BIGINT REFERENCES properties(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  inquiry_type TEXT DEFAULT 'general' CHECK (inquiry_type IN ('general', 'property', 'valuation', 'newsletter')),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'closed', 'archived')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for enquiries
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON enquiries(status);
CREATE INDEX IF NOT EXISTS idx_enquiries_inquiry_type ON enquiries(inquiry_type);
CREATE INDEX IF NOT EXISTS idx_enquiries_property_id ON enquiries(property_id);
CREATE INDEX IF NOT EXISTS idx_enquiries_created_at ON enquiries(created_at DESC);

-- =====================================================
-- TEAM MEMBERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS team_members (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'agent',
  status TEXT DEFAULT 'active',
  last_active TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_team_members_email ON team_members(email);
CREATE INDEX IF NOT EXISTS idx_team_members_status ON team_members(status);

-- =====================================================
-- STATIC PAGES (For per-page SEO management)
-- =====================================================
CREATE TABLE IF NOT EXISTS static_pages (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  meta_title TEXT,
  meta_description TEXT,
  keywords TEXT,
  og_image TEXT,
  noindex BOOLEAN DEFAULT false,
  nofollow BOOLEAN DEFAULT false,
  sitemap_enabled BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'published' CHECK (status IN ('published', 'draft')),
  page_group TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_static_pages_slug ON static_pages(slug);

-- =====================================================
-- SEO SETTINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS seo_settings (
  id BIGSERIAL PRIMARY KEY,
  page_path TEXT UNIQUE NOT NULL,
  meta_title TEXT,
  meta_description TEXT,
  og_title TEXT,
  og_description TEXT,
  og_image TEXT,
  keywords JSONB DEFAULT '[]'::jsonb,
  canonical_url TEXT,
  noindex BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_seo_settings_page_path ON seo_settings(page_path);

-- =====================================================
-- GLOBAL SETTINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS global_settings (
  id BIGSERIAL PRIMARY KEY,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_global_settings_key ON global_settings(setting_key);

-- =====================================================
-- SITE IMAGES TABLE (CMS-managed static imagery)
-- =====================================================
CREATE TABLE IF NOT EXISTS site_images (
  id BIGSERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  url TEXT NOT NULL,
  alt_text TEXT,
  section TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_site_images_key ON site_images(key);
CREATE INDEX IF NOT EXISTS idx_site_images_section ON site_images(section);

-- =====================================================
-- INITIAL DATA
-- =====================================================

-- Default notification settings
INSERT INTO global_settings (setting_key, setting_value)
VALUES ('notifications', jsonb_build_object(
  'enquiryEmail', 'hello@bartlettandpartners.com',
  'sendConfirmation', true,
  'newsletterSync', false
))
ON CONFLICT (setting_key) DO NOTHING;

-- Default analytics settings
INSERT INTO global_settings (setting_key, setting_value)
VALUES ('analytics', jsonb_build_object(
  'googleAnalyticsId', '',
  'googleTagManagerId', '',
  'facebookPixelId', '',
  'enabled', false
))
ON CONFLICT (setting_key) DO NOTHING;

-- Default structured data settings
INSERT INTO global_settings (setting_key, setting_value)
VALUES ('structured_data', jsonb_build_object(
  'organizationName', 'Bartlett & Partners',
  'organizationType', 'RealEstateAgent',
  'description', 'Estate agents in Richmond, Twickenham and Teddington. Director-led service with 30+ years experience.',
  'url', 'https://bartlettandpartners.co.uk',
  'logo', '',
  'telephone', '020 8614 1441',
  'address', jsonb_build_object(
    'streetAddress', '102-104 Church Road',
    'addressLocality', 'Teddington',
    'postalCode', 'TW11 8PY',
    'addressCountry', 'GB'
  ),
  'enabled', true
))
ON CONFLICT (setting_key) DO NOTHING;

-- Default site images placeholders
INSERT INTO site_images (key, url, alt_text, section, description) VALUES
  ('home_cta_background', '', 'Contact us background', 'home', 'Background image for the home page CTA section'),
  ('properties_hero', '', 'Properties page hero', 'properties', 'Hero image for the properties listing page'),
  ('about_hero', '', 'About page hero', 'about', 'Hero image for the about us page'),
  ('contact_background', '', 'Contact page background', 'contact', 'Background image for the contact page')
ON CONFLICT (key) DO NOTHING;

-- Default static pages SEO
INSERT INTO static_pages (name, slug, meta_title, meta_description, sitemap_enabled) VALUES
  ('Home', '/', 'Estate Agents Richmond, Twickenham & Teddington | Bartlett & Partners', 'Independent estate agents in Richmond, Twickenham and Teddington. Director-led service with 30+ years experience. Book your free valuation today.', true),
  ('Properties', '/properties', 'Property for Sale Richmond, Twickenham & Teddington | Bartlett & Partners', 'Browse homes for sale in Richmond, Twickenham, Teddington, Kew and Ham. Family houses, period properties and riverside homes.', true),
  ('About', '/about', 'About Us | Estate Agents Richmond | Bartlett & Partners', 'Meet Darren Bartlett and the team. 30+ years selling homes in Richmond, Twickenham and Teddington. Director-led service, exceptional results.', true),
  ('Insights', '/insights', 'Property Insights & News | Bartlett & Partners', 'Expert insights, market trends and property news from our team of real estate professionals in Richmond and South West London.', true),
  ('Contact', '/contact', 'Contact Us | Estate Agents Teddington | Bartlett & Partners', 'Get in touch with Bartlett & Partners. Based in Teddington, serving Richmond, Twickenham and surrounding areas. Call 020 8614 1441.', true)
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- ROW LEVEL SECURITY (Optional - enable later)
-- =====================================================
-- Uncomment when ready to add authentication:
-- ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Database schema created successfully!';
  RAISE NOTICE '📊 Tables: properties, blog_posts, testimonials, enquiries, team_members, static_pages, seo_settings, global_settings, site_images';
  RAISE NOTICE '🔐 Next: Create storage bucket "bartlett-images" in Supabase Storage';
  RAISE NOTICE '🚀 Ready to connect your application!';
END $$;
