'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  user: { id: string; email: string; name: string; role: string } | null;
  isAuthenticated: boolean;
  login: (token: string, user: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for existing token on mount
    const token = document.cookie.split('; ').find(row => row.startsWith('campusos-token='));
    if (token) {
      const tokenValue = token.split('=')[1];
      try {
        const decoded = Buffer.from(tokenValue, 'base64').toString();
        const [id, email, role] = decoded.split(':');
        if (id && email && role) {
          setUser({ id, email, name: email.split('@')[0], role });
          setIsAuthenticated(true);
        }
      } catch {
        // Invalid token
      }
    }
  }, []);

  const login = (token: string, userData: any) => {
    document.cookie = `campusos-token=${token}; path=/; max-age=86400; samesite=lax`;
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    document.cookie = 'campusos-token=; path=/; max-age=0';
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
