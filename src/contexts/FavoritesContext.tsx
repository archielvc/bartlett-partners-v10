import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { trackPropertyFavorited } from '../utils/analytics';

interface Property {
  id: number;
  title: string;
  location: string;
  price: string;
  priceValue: number;
  beds: number;
  baths: number;
  sqft: string;
  type: string;
  status: string;
  slug: string;
  image: string;
}

interface FavoritesContextType {
  favorites: Property[];
  addToFavorites: (property: Property) => void;
  removeFromFavorites: (propertyId: number) => void;
  isFavorite: (propertyId: number) => boolean;
  toggleFavorite: (property: Property) => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<Property[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bartlett_saved_properties');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Failed to parse saved properties:', e);
          return [];
        }
      }
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('bartlett_saved_properties', JSON.stringify(favorites));
    }
  }, [favorites]);

  const addToFavorites = (property: Property) => {
    trackPropertyFavorited(String(property.id), property.title);
    setFavorites((prev) => {
      if (!prev.find(p => p.id === property.id)) {
        return [...prev, property];
      }
      return prev;
    });
  };

  const removeFromFavorites = (propertyId: number) => {
    setFavorites((prev) => prev.filter(p => p.id !== propertyId));
  };

  const isFavorite = (propertyId: number) => {
    return favorites.some(p => p.id === propertyId);
  };

  const toggleFavorite = (property: Property) => {
    if (isFavorite(property.id)) {
      removeFromFavorites(property.id);
    } else {
      addToFavorites(property);
    }
  };

  return (
    <FavoritesContext.Provider value={{
      favorites,
      addToFavorites,
      removeFromFavorites,
      isFavorite,
      toggleFavorite
    }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
