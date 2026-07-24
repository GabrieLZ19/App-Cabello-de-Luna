'use client';

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { usePathname } from 'next/navigation';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0C0A07] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#C9A45C]"></div>
      </div>
    );
  }

  // Si no hay usuario y no estamos en login, no renderizar nada mientras redirige
  if (!user && pathname !== '/login') {
    return null;
  }

  // Si es asistente y está en ruta restringida, no renderizar nada mientras redirige
  const assistantRestrictedRoutes = [
    '/classes',
    '/franchises',
    '/finances',
    '/roles',
  ];

  if (user && user.role === 'ASSISTANT') {
    const isRestricted = assistantRestrictedRoutes.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`),
    );
    if (isRestricted) {
      return null;
    }
  }

  return <>{children}</>;
}
