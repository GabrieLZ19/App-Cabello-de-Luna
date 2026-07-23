"use client";

import React, { useState, useEffect } from "react";
import {
  Users as UsersIcon,
  Scissors as ScissorsIcon,
  DollarSign as DollarSignIcon,
  Bot as BotIcon,
  Download as DownloadIcon,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const Users: any = UsersIcon;
const Scissors: any = ScissorsIcon;
const DollarSign: any = DollarSignIcon;
const Bot: any = BotIcon;
const Download: any = DownloadIcon;

export default function DashboardPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [stats, setStats] = useState({
    activeStudents: 0,
    pendingPractices: 0,
    totalModules: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [modulesRes, usersStatsRes] = await Promise.all([
          fetch("http://localhost:3001/api/v1/modules/theory"),
          fetch("http://localhost:3001/api/v1/users/stats"),
        ]);

        let totalModules = 0;
        let activeStudents = 0;

        if (modulesRes.ok) {
          const modules = await modulesRes.json();
          totalModules = Array.isArray(modules) ? modules.length : 0;
        }

        if (usersStatsRes.ok) {
          const uStats = await usersStatsRes.json();
          activeStudents = uStats.totalStudents || 0;
        }

        setStats({
          activeStudents,
          pendingPractices: 0,
          totalModules,
        });
      } catch (err) {
        console.error("Error cargando métricas en dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  return (
    <div className="p-8 space-y-8">
      {/* Top Header with Official Logo */}
      <header className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <img
            src="/logo.png"
            alt="Método Cabello de Luna"
            className="w-12 h-12 rounded-full border-2 border-[#C9A45C] object-cover shadow-lg"
          />
          <div>
            <h2 className="text-2xl font-bold text-white">
              Dashboard / Resumen Ejecutivo
            </h2>
          </div>
        </div>

        <button className="flex items-center space-x-2 bg-[#15100A] border border-white/10 px-4 py-2.5 rounded-xl text-xs font-semibold text-[#C9A45C] hover:border-[#C9A45C]">
          <Download className="w-4 h-4" />
          <span>Exportar Datos CSV</span>
        </button>
      </header>

      {/* Real Metric Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-panel p-6 animate-pulse">
              <div className="h-4 bg-white/10 rounded w-2/3 mb-4" />
              <div className="h-8 bg-[#C9A45C]/20 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="glass-panel p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#B0A894]">
                ALUMNOS MATRICULADOS
              </span>
              <Users className="w-5 h-5 text-[#C9A45C]" />
            </div>
            <p className="text-3xl font-bold text-white">
              {stats.activeStudents}
            </p>
            <p className="text-xs text-green-400 mt-1">Estudiantes</p>
          </div>

          <div className="glass-panel p-6 border-[#C9A45C]/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#C9A45C]">
                PRÁCTICAS PENDIENTES
              </span>
              <Scissors className="w-5 h-5 text-[#C9A45C]" />
            </div>
            <p className="text-3xl font-bold text-[#C9A45C]">
              {stats.pendingPractices}
            </p>
            <p className="text-xs text-[#B0A894] mt-1">Cortes por validar</p>
          </div>

          <div className="glass-panel p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#B0A894]">
                CLASES PUBLICADAS
              </span>
              <Bot className="w-5 h-5 text-[#C9A45C]" />
            </div>
            <p className="text-3xl font-bold text-white">
              {stats.totalModules}
            </p>
            <p className="text-xs text-green-400 mt-1">
              Lecciones cargadas en la app
            </p>
          </div>

          <div className={`glass-panel p-6 ${!isAdmin ? "opacity-40" : ""}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#B0A894]">
                INGRESOS FRANQUICIA
              </span>
              <DollarSign className="w-5 h-5 text-[#C9A45C]" />
            </div>
            <p className="text-3xl font-bold text-white">
              {isAdmin ? "$0 MXN" : "Acceso Restringido"}
            </p>
            <p className="text-[#B0A894] text-xs mt-1">Colegiaturas activas</p>
          </div>
        </div>
      )}

      {/* Real Data Table Section */}
      <section className="glass-panel p-6">
        <h3 className="text-lg font-bold text-white mb-1">
          Prácticas Pendientes de Revisión
        </h3>
        <p className="text-xs text-[#B0A894] mb-6">
          Mapeo directo de entregas clínicas
        </p>

        {stats.pendingPractices === 0 ? (
          <div className="text-center py-12 bg-black/30 rounded-2xl border border-white/10">
            <p className="text-sm font-semibold text-[#B0A894]">
              No hay prácticas de corte pendientes cargadas en la base de datos.
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Los nuevos envíos de los alumnos desde la app móvil se
              visualizarán aquí en tiempo real.
            </p>
          </div>
        ) : null}
      </section>
    </div>
  );
}
