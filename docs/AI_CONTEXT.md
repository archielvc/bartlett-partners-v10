# AI Context: Bartlett & Partners Real Estate Site

> This document provides essential context for AI models working with this codebase. It covers architecture, patterns, and critical files to enable faster, more accurate assistance.

## Quick Reference

| Aspect | Technology |
|--------|------------|
| **Framework** | React 18 + TypeScript + Vite |
| **Database** | Supabase (PostgreSQL) |
| **Styling** | Tailwind CSS + shadcn/ui |
| **Animations** | Motion (motion/react) |
| **Routing** | React Router v6 with lazy loading |
| **State** | React Context (7 providers) |
| **Analytics** | PostHog (lazy loaded) |
| **Deployment** | Vercel/Netlify Edge |

---

## Architecture Overview

### Data Flow
```
Supabase DB → src/utils/database.ts (with caching) → React Context → Components → UI
```

### Caching Strategy (Multi-Layer)
1. **In-memory Map** - Fastest, session-scoped
2. **localStorage** - Persists across sessions (5-minute TTL default)
3. **Supabase** - Source of truth

```typescript
// Cache utilities in src/utils/database.ts
const memoryCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getStored<T>(key: string): T | null { /* checks memory, then localStorage */ }
function setCache<T>(key: string, data: T): void { /* writes to both caches */ }
```

### Route Lazy Loading
All page routes are lazy loaded via `React.lazy()` in `src/App.tsx`:
```typescript
const PropertyListingPage = lazy(() => import('./pages/PropertyListingPage'));
const PropertyDetail = lazy(() => import('./pages/PropertyDetail'));
// etc.
```

---

## Key Patterns

### Image Optimization
**ALWAYS use `OptimizedImage` component, never raw `<img>` tags.**

```typescript
import { OptimizedImage } from "@/components/OptimizedImage";

<OptimizedImage
  src={imageUrl}
  alt="Description"
  priority={true}        // For above-fold images
  enableLQIP={true}      // Low-quality image placeholder (Unsplash only)
  aspectRatio="4/3"      // Maintains aspect ratio
  fetchPriority="high"   // Browser priority hint
/>
```

Features:
- IntersectionObserver lazy loading
- LQIP blur-up effect for Unsplash images
- Error handling with fallback
- Native loading/decoding attributes

### Database Queries
**All queries go through `src/utils/database.ts`. Never query Supabase directly from components.**

Common functions:
```typescript
// Properties
getPublishedProperties()      // All published properties (cached)
getPropertyBySlug(slug)       // Single property by URL slug
getRelatedProperties(id, 3)   // 3 related properties, excluding current
getHomeFeaturedProperties()   // Featured properties for homepage (cached)

// Testimonials
getPublishedTestimonials()    // All published testimonials (cached)

// Global Settings (KV Store)
get<T>(key)                   // Get global setting by key
set(key, value)               // Update global setting (admin only)
```

### Animation Guidelines
**Use Motion (motion/react) for animations. GSAP was removed.**

```typescript
import { motion } from "motion/react";

// Stagger fade-in pattern
<motion.div
  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-50px" }}
  transition={{ duration: 0.6, delay: index * 0.1 }}
>
  {content}
</motion.div>

// CSS-based hover effects (no motion needed)
className="transition-transform duration-500 ease-out hover:scale-105"
```

### Form Handling
**Use `UnifiedContactForm` for all contact/inquiry forms.**

Location: `src/components/forms/UnifiedContactForm.tsx`

Features:
- Multiple form types (valuation, property inquiry, general contact)
- Phone number validation with react-phone-number-input
- Property multi-selector for inquiries
- Supabase enquiries table integration

---

## Critical Files

| File | Purpose | Lines |
|------|---------|-------|
| `src/utils/database.ts` | All database queries, caching, transforms | ~1300 |
| `src/components/OptimizedImage.tsx` | Image optimization component | ~150 |
| `src/utils/kvStore.ts` | Global settings abstraction | ~100 |
| `src/App.tsx` | Route definitions, lazy loading | ~200 |
| `vite.config.ts` | Build configuration, chunking | ~90 |

### Context Providers (src/contexts/)
| Context | Purpose |
|---------|---------|
| `SiteContext` | Site settings, images, global config |
| `AuthContext` | Admin authentication state |
| `LoadingContext` | Page loading states |
| `FavoritesContext` | User's saved properties |
| `AnalyticsContext` | PostHog integration |
| `CookieContext` | Cookie consent management |
| `SEOContext` | Dynamic meta tags |

---

## Component Organization

```
src/components/
├── home/           # Homepage sections (Hero, Featured, Team, CTA, etc.)
├── cms/            # Admin panel components
├── ui/             # shadcn/ui primitives (49 components)
├── forms/          # Form components (UnifiedContactForm, etc.)
├── features/       # Feature components (PredictiveLink, etc.)
├── insights/       # Blog/insights components
└── [component].tsx # Shared components (PropertyCard, OptimizedImage, etc.)

src/pages/          # Route components (lazy loaded)
├── Home.tsx
├── PropertyListingPage.tsx
├── PropertyDetail.tsx
├── BlogPage.tsx
├── BlogDetailPage.tsx
└── admin/          # CMS pages
```

---

## Database Schema (Key Tables)

### properties
```sql
id, title, slug, description, price, bedrooms, bathrooms, sqft,
address, postcode, latitude, longitude, status, property_type,
images (jsonb), features (jsonb), floorplan_url, created_at
```
**Indexes**: `idx_properties_slug`, `idx_properties_status`

### testimonials
```sql
id, author, company, content, rating, published, display_order, created_at
```
**Index**: `idx_testimonials_published_order`

### enquiries
```sql
id, type, name, email, phone, message, property_ids (jsonb),
status, created_at
```

### global_settings
```sql
id, setting_key, setting_value (jsonb), updated_at
```
**Index**: `idx_global_settings_key`

---

## Common Tasks

### Adding a New Property Field
1. Add column via Supabase MCP: `apply_migration`
2. Update `src/types/property.ts` (Property interface)
3. Update `src/types/database.ts` (DBProperty interface)
4. Update `transformPropertyToUI()` in `src/utils/database.ts`
5. Update relevant components (PropertyCard, PropertyDetail)

### Adding a New Page
1. Create page component in `src/pages/`
2. Add lazy import in `src/App.tsx`
3. Add route in `<Routes>` section
4. Add to navigation if needed

### Modifying Homepage Sections
Homepage sections are in `src/components/home/`:
- `Hero.tsx` - Hero banner with search
- `HomeFeaturedProperties.tsx` - Property grid
- `HomeServicesNew.tsx` - Services section
- `HomeTeam.tsx` - Team members
- `HomeCTA.tsx` - Call to action
- `ExploreBoroughs.tsx` - Area exploration

### Adding Database Caching
```typescript
export async function getNewData(): Promise<DataType[]> {
  const cacheKey = 'new_data_v1';
  const cached = getStored<DataType[]>(cacheKey);
  if (cached) return cached;

  const { data, error } = await supabase
    .from('table')
    .select('*');

  if (error) {
    console.error('Error fetching data:', error);
    return [];
  }

  const result = data || [];
  if (result.length > 0) {
    setCache(cacheKey, result);
  }
  return result;
}
```

---

## Performance Optimizations (Applied)

### Database
- Indexes on frequently queried columns (slug, status, setting_key)
- Caching layer with 5-minute TTL
- Optimized queries (e.g., `getRelatedProperties` fetches only 3 items)

### Images
- All images use `OptimizedImage` with lazy loading
- LQIP blur-up for Unsplash images
- `priority={true}` for above-fold images

### Bundle
- Route-level code splitting via `React.lazy()`
- Vendor chunks for React, Radix, Motion, Supabase, Recharts
- PostHog lazy loaded after 2 seconds or first interaction
- GSAP removed (68KB saved)

### Fonts
- Preconnected to Google Fonts
- No `@import` in CSS (render-blocking)
- Only used weights loaded (Playfair 400/600/700, Figtree 400/500/600)

---

## Important Notes

1. **Never use GSAP** - Removed from project, use Motion or CSS
2. **Never use ImageWithFallback** - Use OptimizedImage instead
3. **Never query Supabase directly** - Use database.ts functions
4. **Always lazy load routes** - Add to App.tsx with React.lazy()
5. **Cache expensive queries** - Use getStored/setCache pattern
6. **Respect reduced motion** - Check `prefers-reduced-motion`

---

## Environment Variables

```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
VITE_POSTHOG_API_KEY=xxx
```

**Note**: `.env` is in `.gitignore` for security. Never commit credentials.

---

## Deployment

The site is designed for deployment on Vercel or Netlify with:
- Edge functions for SSR (if needed)
- CDN caching for static assets
- Automatic preview deployments

Build command: `npm run build`
Output directory: `dist/`
