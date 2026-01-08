import { useQuery } from '@tanstack/react-query';
import { getEnabledAreas, getAreasWithAvailableProperties } from '../utils/database';
import { queryKeys } from '../lib/queryClient';
import type { Area } from '../types/database';

// Fallback areas for instant render while fetching from DB
const FALLBACK_AREAS: Area[] = [
  { id: 1, name: 'Twickenham', display_order: 1, enabled: true, created_at: '', updated_at: '' },
  { id: 2, name: 'Teddington', display_order: 2, enabled: true, created_at: '', updated_at: '' },
  { id: 3, name: 'Kew', display_order: 3, enabled: true, created_at: '', updated_at: '' },
  { id: 4, name: 'Ham', display_order: 4, enabled: true, created_at: '', updated_at: '' },
  { id: 5, name: 'Cobham', display_order: 5, enabled: true, created_at: '', updated_at: '' },
  { id: 6, name: 'Hampton', display_order: 6, enabled: true, created_at: '', updated_at: '' },
  { id: 7, name: 'Hinchley Wood', display_order: 7, enabled: true, created_at: '', updated_at: '' },
  { id: 8, name: 'Lower Sunbury', display_order: 8, enabled: true, created_at: '', updated_at: '' },
  { id: 9, name: 'St. Margarets', display_order: 9, enabled: true, created_at: '', updated_at: '' },
  { id: 10, name: 'Strawberry Hill', display_order: 10, enabled: true, created_at: '', updated_at: '' },
  { id: 11, name: 'West Molesey', display_order: 11, enabled: true, created_at: '', updated_at: '' },
  { id: 12, name: 'Weybridge', display_order: 12, enabled: true, created_at: '', updated_at: '' },
  { id: 13, name: 'Whitton', display_order: 13, enabled: true, created_at: '', updated_at: '' },
];

// Fallback areas that have available properties (for nav dropdowns)
const FALLBACK_AREAS_WITH_PROPERTIES = ['Ham', 'Kew', 'Teddington', 'Twickenham', 'West Molesey'];

/**
 * Hook for all enabled areas (used for Properties page filter)
 */
export function useAreas() {
  return useQuery<Area[], Error>({
    queryKey: queryKeys.areasEnabled,
    queryFn: getEnabledAreas,
    staleTime: 10 * 60 * 1000, // 10 minutes - areas change rarely
    gcTime: 60 * 60 * 1000, // 1 hour
    placeholderData: FALLBACK_AREAS, // Renders instantly while fetching
  });
}

/**
 * Hook for areas that have available properties (used for nav dropdowns)
 * Returns string[] instead of Area[] for simpler usage
 */
export function useAreasWithProperties() {
  return useQuery<string[], Error>({
    queryKey: ['areas', 'withProperties'],
    queryFn: getAreasWithAvailableProperties,
    staleTime: 5 * 60 * 1000, // 5 minutes - properties can change more frequently
    gcTime: 30 * 60 * 1000, // 30 minutes
    placeholderData: FALLBACK_AREAS_WITH_PROPERTIES, // Renders instantly while fetching
  });
}
