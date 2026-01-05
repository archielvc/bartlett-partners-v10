import { useQuery } from '@tanstack/react-query';
import { getHomeFeaturedProperties } from '../utils/database';
import { queryKeys } from '../lib/queryClient';
import type { Property } from '../types/property';

export function useFeaturedProperties() {
  return useQuery<Property[], Error>({
    queryKey: queryKeys.featuredProperties,
    queryFn: getHomeFeaturedProperties,
    staleTime: 5 * 60 * 1000,
  });
}
