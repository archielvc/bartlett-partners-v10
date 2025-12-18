import { useState, useEffect } from 'react';
import { googleMapsApiKey } from '../../utils/env';

export function useGoogleMapsScript() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if already loaded
    if (window.google?.maps?.places?.PlaceAutocompleteElement) {
      setIsLoaded(true);
      return;
    }

    // Check if API key exists
    if (!googleMapsApiKey || googleMapsApiKey === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
      console.warn('Google Maps API Key is missing. Please add VITE_GOOGLE_MAPS_API_KEY to your environment variables.');
      setError('Google Maps API key not configured');
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => {
         if (window.google?.maps?.places) {
           setIsLoaded(true);
         }
      });
      return;
    }

    // Load the script with ASYNC and new Places API
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places&loading=async`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      if (window.google?.maps?.places) {
        setIsLoaded(true);
      } else {
        setError('Google Maps Places library failed to load');
      }
    };
    script.onerror = () => setError('Failed to load Google Maps');
    
    document.head.appendChild(script);

    return () => {
      // Cleanup if needed
    };
  }, []);

  return { isLoaded, error };
}