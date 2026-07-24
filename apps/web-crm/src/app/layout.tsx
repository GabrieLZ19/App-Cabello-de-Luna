import './globals.css';
import React from 'react';
import { AuthProvider } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import AuthGuard from '../components/AuthGuard';

export const metadata = {
  title: 'ILTCT CRM Panel • Método Cabello de Luna',
  description: 'Panel de Administración y Control para Mariana Gualda y Equipo',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-[#0C0A07] text-white min-h-screen">
        <AuthProvider>
          <AuthGuard>
            <div className="flex min-h-screen bg-[#0C0A07]">
              <Sidebar />
              <div className="flex-1 overflow-y-auto">{children}</div>
            </div>
          </AuthGuard>
        </AuthProvider>
      </body>
    </html>
  );
}

