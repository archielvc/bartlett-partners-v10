import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data considered fresh for 5 minutes (matches existing CACHE_TTL)
      staleTime: 5 * 60 * 1000,

      // Keep unused data in cache for 30 minutes
      gcTime: 30 * 60 * 1000,

      // Don't refetch on window focus for better UX
      refetchOnWindowFocus: false,

      // Don't refetch on mount if data is fresh - critical for instant navigation
      refetchOnMount: false,

      // Retry failed requests twice
      retry: 2,
    },
  },
});

// Query keys for type safety and consistency
export const queryKeys = {
  featuredProperties: ['properties', 'featured'] as const,
  properties: ['properties'] as const,
  testimonials: ['testimonials'] as const,
  blogPosts: ['blog', 'posts'] as const,
  blogPostsLight: ['blog', 'posts', 'light'] as const,
  areas: ['areas'] as const,
  areasEnabled: ['areas', 'enabled'] as const,
} as const;
