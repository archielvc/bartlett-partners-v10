import { createContext, useContext, useState, ReactNode } from 'react';

interface LoadingContextType {
  isLoadingComplete: boolean;
  setIsLoadingComplete: (value: boolean) => void;
  hasLoadedBefore: boolean;
  setHasLoadedBefore: (value: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoadingComplete, setIsLoadingComplete] = useState(false);
  const [hasLoadedBefore, setHasLoadedBefore] = useState(false);

  return (
    <LoadingContext.Provider 
      value={{ 
        isLoadingComplete, 
        setIsLoadingComplete,
        hasLoadedBefore,
        setHasLoadedBefore
      }}
    >
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}
