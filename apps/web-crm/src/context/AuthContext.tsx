'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'ASSISTANT';
}

interface AuthContextType {
  user: UserSession | null;
  login: (email: string, role: 'ADMIN' | 'ASSISTANT') => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const stored = localStorage.getItem('iltct_crm_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {
        localStorage.removeItem('iltct_crm_user');
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (!user && pathname !== '/login') {
        router.push('/login');
      }
    }
  }, [user, isLoading, pathname, router]);

  const login = (email: string, role: 'ADMIN' | 'ASSISTANT') => {
    const sessionUser: UserSession = {
      id: role === 'ADMIN' ? 'usr-mariana' : 'usr-dani',
      name: role === 'ADMIN' ? 'Mariana Gualda' : 'Dani',
      email,
      role,
    };
    setUser(sessionUser);
    localStorage.setItem('iltct_crm_user', JSON.stringify(sessionUser));
    router.push('/dashboard');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('iltct_crm_user');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}
