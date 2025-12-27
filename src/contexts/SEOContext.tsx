import { createContext, useContext, useState, ReactNode } from 'react';

interface SEOData {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  type?: 'website' | 'article' | 'product';
}

interface SEOContextType {
  seoData: SEOData;
  setSEOData: (data: SEOData) => void;
}

const SEOContext = createContext<SEOContextType | undefined>(undefined);

export function SEOProvider({ children }: { children: ReactNode }) {
  const [seoData, setSEOData] = useState<SEOData>({});

  return (
    <SEOContext.Provider value={{ seoData, setSEOData }}>
      {children}
    </SEOContext.Provider>
  );
}

export function useSEO() {
  const context = useContext(SEOContext);
  if (!context) {
    throw new Error('useSEO must be used within SEOProvider');
  }
  return context;
}
