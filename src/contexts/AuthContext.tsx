import { createContext, useContext, useState, ReactNode } from 'react';

// Auth types
export type UserRole = 'admin' | 'agent';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (role: UserRole) => void;
  logout: () => void;
  isLoading: boolean;
  /** True if current user can edit site images (admin only) */
  canEditImages: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = (role: UserRole) => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      const mockUser: User = {
        id: role === 'admin' ? 'admin-123' : 'agent-456',
        email: role === 'admin' ? 'admin@bartlett.com' : 'agent@bartlett.com',
        name: role === 'admin' ? 'Admin User' : 'Sales Agent',
        role: role,
        avatar: 'https://github.com/shadcn.png'
      };
      setUser(mockUser);
      setIsLoading(false);
    }, 800);
  };

  const logout = () => {
    setUser(null);
  };

  // Admin-only permission for editing site images
  const canEditImages = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, canEditImages }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  // Return safe defaults instead of throwing when used outside AuthProvider
  // This allows components like InlineEditableImage to work anywhere
  if (context === undefined) {
    return {
      user: null,
      login: () => { },
      logout: () => { },
      isLoading: false,
      canEditImages: false,
    };
  }
  return context;
}

