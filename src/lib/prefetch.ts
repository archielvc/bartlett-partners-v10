import { queryClient, queryKeys } from './queryClient';
import { getHomeFeaturedProperties, getPublishedTestimonials } from '../utils/database';

/**
 * Prefetch critical data during the loading screen.
 * This runs in parallel and populates the React Query cache
 * so data is instantly available when components mount.
 */
export async function prefetchCriticalData(): Promise<void> {
  await Promise.all([
    prefetchFeaturedProperties(),
    prefetchTestimonials(),
  ]);
}

export async function prefetchFeaturedProperties(): Promise<void> {
  await queryClient.prefetchQuery({
    queryKey: queryKeys.featuredProperties,
    queryFn: getHomeFeaturedProperties,
    staleTime: 5 * 60 * 1000,
  });
}

export async function prefetchTestimonials(): Promise<void> {
  await queryClient.prefetchQuery({
    queryKey: queryKeys.testimonials,
    queryFn: getPublishedTestimonials,
    staleTime: 5 * 60 * 1000,
  });
}
