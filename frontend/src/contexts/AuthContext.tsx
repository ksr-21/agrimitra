import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type UserRole = 'FARMER' | 'BUYER' | 'DELIVERY' | 'ADMIN';

interface User {
  id: string;
  phone: string;
  role: UserRole;
  profile: any;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from localStorage on mount (no API call needed)
  useEffect(() => {
    const storedToken = localStorage.getItem('agrimitra-token');
    const storedUser = localStorage.getItem('agrimitra-user');
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('agrimitra-token');
        localStorage.removeItem('agrimitra-user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('agrimitra-token', newToken);
    localStorage.setItem('agrimitra-user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('agrimitra-token');
    localStorage.removeItem('agrimitra-user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
