"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/context/AuthContext";

type ToastItem = {
  id: string;
  title: string;
  body: string;
  href?: string;
  exiting?: boolean;
};

type RealtimeContextValue = {
  connected: boolean;
  toasts: ToastItem[];
  dismissToast: (id: string) => void;
};

const RealtimeContext = createContext<RealtimeContextValue>({
  connected: false,
  toasts: [],
  dismissToast: () => undefined,
});

function getSocketBaseUrl() {
  const api =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
  return api.replace(/\/api\/v1\/?$/, "");
}

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const [connected, setConnected] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)),
    );
    const existing = timersRef.current.get(id);
    if (existing) clearTimeout(existing);
    const removeTimer = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      timersRef.current.delete(id);
    }, 280);
    timersRef.current.set(id, removeTimer);
  }, []);

  const pushToast = useCallback(
    (title: string, body: string, href?: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev.slice(-3), { id, title, body, href }]);
      const autoClose = setTimeout(() => dismissToast(id), 7000);
      timersRef.current.set(id, autoClose);
    },
    [dismissToast],
  );

  useEffect(() => {
    return () => {
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current.clear();
    };
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("iltct_crm_token")
        : null;

    if (!token || !user) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setConnected(false);
      return;
    }

    const socket = io(`${getSocketBaseUrl()}/realtime`, {
      auth: { token },
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.on("practice:submitted", (payload: any) => {
      pushToast(
        "Nueva práctica para revisar",
        `${payload.studentName || "Alumna"} · ${payload.modelName || "Modelo"} · Corte ${payload.cutNumber}`,
        "/practices",
      );
      window.dispatchEvent(
        new CustomEvent("iltct:practice-submitted", { detail: payload }),
      );
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user, isLoading, pushToast]);

  const value = useMemo(
    () => ({ connected, toasts, dismissToast }),
    [connected, toasts, dismissToast],
  );

  return (
    <RealtimeContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2.5 max-w-sm w-[calc(100%-2rem)] pointer-events-none">
        {toasts.map((toast) => (
          <a
            key={toast.id}
            href={toast.href || "#"}
            onClick={(e) => {
              if (!toast.href) e.preventDefault();
              dismissToast(toast.id);
            }}
            className={`pointer-events-auto flex items-start gap-3 bg-[#15100A]/95 backdrop-blur-md border border-[#C9A45C]/35 rounded-2xl p-3.5 shadow-2xl hover:border-[#C9A45C] transition-colors ${
              toast.exiting ? "crm-toast-exit" : "crm-toast-enter"
            }`}
          >
            <img
              src="/logo.png"
              alt="ILTCT"
              className="w-9 h-9 rounded-full border border-[#C9A45C]/40 object-cover shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[#C9A45C]">{toast.title}</p>
              <p className="text-[11px] text-[#B0A894] mt-0.5 leading-relaxed">
                {toast.body}
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                dismissToast(toast.id);
              }}
              className="text-gray-500 hover:text-white text-xs shrink-0 pt-0.5"
            >
              Cerrar
            </button>
          </a>
        ))}
      </div>
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  return useContext(RealtimeContext);
}
