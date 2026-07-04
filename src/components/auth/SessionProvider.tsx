'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

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
