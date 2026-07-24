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
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function restoreSession() {
      const token = localStorage.getItem('iltct_crm_token');
      const storedUser = localStorage.getItem('iltct_crm_user');

      if (token && storedUser) {
        try {
          // Validar el token con el endpoint /auth/me
          const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            const sessionUser: UserSession = {
              id: data.id,
              name: data.fullName,
              email: data.email,
              role: data.role,
            };
            setUser(sessionUser);
            localStorage.setItem('iltct_crm_user', JSON.stringify(sessionUser));
          } else {
            // Token inválido o expirado
            logout();
          }
        } catch (e) {
          console.error('Error al restaurar sesión:', e);
          // Intentar usar la sesión offline si falla la conexión temporalmente
          try {
            setUser(JSON.parse(storedUser));
          } catch (err) {
            logout();
          }
        }
      }
      setIsLoading(false);
    }

    restoreSession();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (!user && pathname !== '/login') {
        router.push('/login');
      } else if (user && user.role === 'ASSISTANT') {
        const assistantRestrictedRoutes = [
          '/classes',
          '/franchises',
          '/finances',
          '/roles',
        ];
        const isRestricted = assistantRestrictedRoutes.some(
          (route) => pathname === route || pathname.startsWith(`${route}/`),
        );
        if (isRestricted) {
          router.push('/dashboard');
        }
      }
    }
  }, [user, isLoading, pathname, router]);

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          message: errorData.message || 'Credenciales inválidas o error de red.',
        };
      }

      const data = await response.json();
      
      // Validar si el rol es elegible para el CRM
      if (data.user.role !== 'ADMIN' && data.user.role !== 'ASSISTANT') {
        return {
          success: false,
          message: 'Acceso denegado: Tu usuario no tiene un rol administrativo.',
        };
      }

      const sessionUser: UserSession = {
        id: data.user.id,
        name: data.user.fullName,
        email: data.user.email,
        role: data.user.role,
      };

      setUser(sessionUser);
      localStorage.setItem('iltct_crm_token', data.accessToken);
      localStorage.setItem('iltct_crm_user', JSON.stringify(sessionUser));
      
      router.push('/dashboard');
      return { success: true };
    } catch (error) {
      console.error('Error en login:', error);
      return {
        success: false,
        message: 'Error al conectar con el servidor.',
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('iltct_crm_token');
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

