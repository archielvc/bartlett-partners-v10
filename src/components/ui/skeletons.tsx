/**
 * Skeleton Loading Components
 * ===========================
 * Content-shaped loading placeholders that provide better perceived
 * performance than spinners. Match the shape of actual content.
 */

import { cn } from './utils';

// =====================================================
// BASE SKELETON
// =====================================================

interface SkeletonProps {
  className?: string;
}

/**
 * Base skeleton with shimmer animation
 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 rounded',
        className
      )}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
    </div>
  );
}

// =====================================================
// PROPERTY CARD SKELETON
// =====================================================

/**
 * Skeleton for PropertyCard component
 * Matches the exact layout of the property card
 */
export function PropertyCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
      {/* Image area */}
      <div className="relative aspect-[4/3]">
        <Skeleton className="absolute inset-0 rounded-none" />
        {/* Status badge placeholder */}
        <div className="absolute top-4 left-4">
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        {/* Favorite button placeholder */}
        <div className="absolute top-4 right-4">
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>

      {/* Content area */}
      <div className="p-5 space-y-4">
        {/* Title */}
        <Skeleton className="h-6 w-3/4" />

        {/* Location */}
        <Skeleton className="h-4 w-1/2" />

        {/* Price */}
        <Skeleton className="h-7 w-1/3" />

        {/* Features row */}
        <div className="flex gap-4 pt-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}

// =====================================================
// PROPERTY GRID SKELETON
// =====================================================

/**
 * Skeleton for a grid of property cards
 */
export function PropertyGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <PropertyCardSkeleton key={i} />
      ))}
    </div>
  );
}

// =====================================================
// PROPERTY DETAIL SKELETON
// =====================================================

/**
 * Skeleton for PropertyDetail page
 * Matches the hero image gallery and content layout
 */
export function PropertyDetailSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Hero image gallery */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[50vh] lg:h-[70vh] mb-8 lg:mb-12">
        {/* Main image */}
        <div className="lg:col-span-2 relative">
          <Skeleton className="absolute inset-0 rounded-lg" />
        </div>

        {/* Thumbnail grid */}
        <div className="hidden lg:grid grid-cols-2 grid-rows-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="rounded-lg" />
          ))}
        </div>
      </div>

      {/* Content section */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title and location */}
            <div className="space-y-3">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-5 w-1/2" />
            </div>

            {/* Price */}
            <Skeleton className="h-8 w-1/4" />

            {/* Features grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-lg" />
              ))}
            </div>

            {/* Description */}
            <div className="space-y-3">
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// FEATURED PROPERTIES SKELETON
// =====================================================

/**
 * Skeleton for HomeFeaturedProperties section
 */
export function FeaturedPropertiesSkeleton() {
  return (
    <div className="space-y-8">
      {/* Section header */}
      <div className="text-center space-y-3">
        <Skeleton className="h-8 w-64 mx-auto" />
        <Skeleton className="h-4 w-96 mx-auto" />
      </div>

      {/* Property grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <PropertyCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

// =====================================================
// HERO SKELETON
// =====================================================

/**
 * Skeleton for Hero section
 */
export function HeroSkeleton() {
  return (
    <div className="relative h-screen">
      <Skeleton className="absolute inset-0 rounded-none" />

      {/* Content overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center space-y-6 max-w-3xl px-4">
          <Skeleton className="h-12 w-3/4 mx-auto" />
          <Skeleton className="h-6 w-1/2 mx-auto" />
          <Skeleton className="h-12 w-48 mx-auto rounded-full" />
        </div>
      </div>
    </div>
  );
}

// =====================================================
// BLOG CARD SKELETON
// =====================================================

/**
 * Skeleton for blog post cards
 */
export function BlogCardSkeleton() {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm">
      {/* Image */}
      <Skeleton className="aspect-[16/9]" />

      {/* Content */}
      <div className="p-6 space-y-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex justify-between items-center pt-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for blog grid
 */
export function BlogGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <BlogCardSkeleton key={i} />
      ))}
    </div>
  );
}

// =====================================================
// TESTIMONIAL SKELETON
// =====================================================

/**
 * Skeleton for testimonial cards
 */
export function TestimonialSkeleton() {
  return (
    <div className="bg-white rounded-xl p-8 shadow-sm space-y-4">
      {/* Stars */}
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-5 w-5 rounded-full" />
        ))}
      </div>

      {/* Quote */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>

      {/* Author */}
      <div className="flex items-center gap-3 pt-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
    </div>
  );
}

// =====================================================
// TEXT SKELETONS
// =====================================================

/**
 * Skeleton for text content blocks
 */
export function TextBlockSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-4"
          style={{ width: i === lines - 1 ? '75%' : '100%' }}
        />
      ))}
    </div>
  );
}

/**
 * Skeleton for headings
 */
export function HeadingSkeleton({ size = 'lg' }: { size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const heights = {
    sm: 'h-5',
    md: 'h-6',
    lg: 'h-8',
    xl: 'h-10',
  };

  return <Skeleton className={`${heights[size]} w-2/3`} />;
}
