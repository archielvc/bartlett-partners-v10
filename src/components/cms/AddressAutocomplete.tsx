import { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2, AlertCircle } from 'lucide-react';
import { useGoogleMapsScript } from './useGoogleMapsScript';

interface AddressAutocompleteProps {
  value: string;
  onChange: (address: string, postcode: string | null, fullPlace: google.maps.places.PlaceResult | null) => void;
  placeholder?: string;
  className?: string;
}

export function AddressAutocomplete({ 
  value, 
  onChange, 
  placeholder = "Start typing an address...",
  className = ""
}: AddressAutocompleteProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const fallbackInputRef = useRef<HTMLInputElement>(null);
  const autocompleteElementRef = useRef<google.maps.places.PlaceAutocompleteElement | null>(null);
  const { isLoaded, error } = useGoogleMapsScript();
  const [inputValue, setInputValue] = useState(value);
  const [showFallback, setShowFallback] = useState(true);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (!isLoaded || !containerRef.current || autocompleteElementRef.current) return;

    try {
      // Hide the fallback input
      setShowFallback(false);

      // Create the new PlaceAutocompleteElement
      const autocompleteElement = new google.maps.places.PlaceAutocompleteElement({
        componentRestrictions: { country: 'gb' },
      });

      // Style the autocomplete element
      autocompleteElement.setAttribute('placeholder', placeholder);
      
      // Add event listener for place selection
      autocompleteElement.addEventListener('gmp-placeselect', async (event: any) => {
        const place = event.place;
        
        if (!place) return;

        // Fetch full place details
        await place.fetchFields({
          fields: ['formattedAddress', 'addressComponents', 'location']
        });

        if (!place.formattedAddress) return;

        // Extract postcode from address components
        let postcode = '';
        if (place.addressComponents) {
          for (const component of place.addressComponents) {
            if (component.types.includes('postal_code')) {
              postcode = component.longText;
              break;
            }
          }
        }

        setInputValue(place.formattedAddress);
        onChange(place.formattedAddress, postcode, place.toJSON());
      });

      // Append to container
      containerRef.current.appendChild(autocompleteElement);
      autocompleteElementRef.current = autocompleteElement;

    } catch (err) {
      console.error('Error initializing PlaceAutocompleteElement:', err);
      setShowFallback(true); // Show fallback if autocomplete fails
    }

    return () => {
      if (autocompleteElementRef.current) {
        autocompleteElementRef.current.remove();
        autocompleteElementRef.current = null;
      }
    };
  }, [isLoaded, onChange, placeholder]);

  // Always show manual input if there's an error or not yet loaded
  if (error || showFallback) {
    return (
      <div className="space-y-2">
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          {!isLoaded && !error && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
          )}
          <input
            ref={fallbackInputRef}
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              onChange(e.target.value, null, null);
            }}
            placeholder={placeholder}
            disabled={!error && !isLoaded}
            className={`w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2551] focus:border-transparent disabled:bg-gray-50 ${className}`}
          />
        </div>
        {error && (
          <p className="text-xs text-amber-600 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Address autocomplete unavailable - enter manually
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
      
      <div 
        ref={containerRef}
        className="relative"
        style={{
          '--gmpx-color-surface': 'white',
          '--gmpx-color-on-surface': '#1A2551',
          '--gmpx-color-primary': '#1A2551',
          '--gmpx-font-family': 'inherit',
          '--gmpx-font-size': '14px',
        } as any}
      >
        {/* PlaceAutocompleteElement will be inserted here */}
      </div>

      <style>{`
        gmp-place-autocomplete {
          width: 100%;
        }
        gmp-place-autocomplete input {
          width: 100%;
          padding: 0.5rem 2.5rem 0.5rem 2.5rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          outline: none;
        }
        gmp-place-autocomplete input:focus {
          border-color: #1A2551;
          box-shadow: 0 0 0 2px rgba(26, 37, 81, 0.1);
        }
        gmp-place-autocomplete input:disabled {
          background-color: #f9fafb;
        }
      `}</style>
    </div>
  );
}