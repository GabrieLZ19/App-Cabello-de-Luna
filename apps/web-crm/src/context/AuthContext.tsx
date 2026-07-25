"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "ASSISTANT";
}

interface AuthContextType {
  user: UserSession | null;
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

// Funciones auxiliares nativas para cookies (sin librerías externas)
const setCookie = (name: string, value: string, days = 7) => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
};

const deleteCookie = (name: string) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      const storedUser = localStorage.getItem("iltct_crm_user");
      const token = localStorage.getItem("iltct_crm_token");

      if (token && storedUser) {
        try {
          const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
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
            localStorage.setItem("iltct_crm_user", JSON.stringify(sessionUser));
            setCookie("iltct_crm_token", token);
            setCookie("iltct_crm_role", data.role);
          } else {
            logout();
          }
        } catch (e) {
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

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          message:
            errorData.message || "Credenciales inválidas o error de red.",
        };
      }

      const data = await response.json();

      if (data.user.role !== "ADMIN" && data.user.role !== "ASSISTANT") {
        return {
          success: false,
          message:
            "Acceso denegado: Tu usuario no tiene un rol administrativo.",
        };
      }

      const sessionUser: UserSession = {
        id: data.user.id,
        name: data.user.fullName,
        email: data.user.email,
        role: data.user.role,
      };

      setUser(sessionUser);

      // Guardar tanto en localStorage como en Cookies para que Middleware responda de inmediato
      localStorage.setItem("iltct_crm_token", data.accessToken);
      localStorage.setItem("iltct_crm_user", JSON.stringify(sessionUser));

      setCookie("iltct_crm_token", data.accessToken);
      setCookie("iltct_crm_role", data.user.role);

      window.location.href = "/dashboard";
      return { success: true };
    } catch (error) {
      console.error("Error en login:", error);
      return { success: false, message: "Error al conectar con el servidor." };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("iltct_crm_token");
    localStorage.removeItem("iltct_crm_user");

    deleteCookie("iltct_crm_token");
    deleteCookie("iltct_crm_role");

    window.location.href = "/login";
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
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
}
