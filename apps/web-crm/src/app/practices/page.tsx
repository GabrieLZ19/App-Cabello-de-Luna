"use client";

import React, { useEffect, useState } from "react";
import {
  Scissors as ScissorsIcon,
  Eye as EyeIcon,
  RefreshCw as RefreshCwIcon,
} from "lucide-react";
import {
  getPendingCutsForReview,
  PendingCut,
} from "@/services/practicesService";
import { CutReviewModal } from "@/components/practices/CutReviewModal";

const Scissors: any = ScissorsIcon;
const Eye: any = EyeIcon;
const RefreshCw: any = RefreshCwIcon;

export default function PracticesPage() {
  const [practices, setPractices] = useState<PendingCut[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCut, setSelectedCut] = useState<PendingCut | null>(null);

  const fetchCuts = async () => {
    setLoading(true);
    try {
      const data = await getPendingCutsForReview();
      setPractices(data);
    } catch (err) {
      console.error("Error cargando cola de prácticas:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCuts();
  }, []);

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[#15100A] p-4 sm:p-6 rounded-2xl border border-white/10 gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white">
            Cola de Validación de Prácticas
          </h2>
          <p className="text-xs text-[#B0A894] mt-1">
            Revisión de fichas clínicas de corte enviadas por estudiantes
          </p>
        </div>

        <button
          onClick={fetchCuts}
          className="flex items-center space-x-2 bg-white/5 hover:bg-white/10 text-white px-3 py-2 rounded-xl border border-white/10 text-xs font-semibold transition-colors"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
          />
          <span>Actualizar</span>
        </button>
      </div>

      {/* Tabla de Prácticas Pendientes */}
      <div className="glass-panel p-4 sm:p-6">
        {loading ? (
          <div className="text-center py-12 text-[#B0A894] text-xs">
            Cargando prácticas pendientes...
          </div>
        ) : practices.length === 0 ? (
          <div className="text-center py-12 bg-black/30 rounded-xl border border-white/10 p-4">
            <Scissors className="w-8 h-8 text-gray-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-[#B0A894]">
              No hay prácticas de corte pendientes de revisión.
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Cuando los alumnos envíen sus evidencias Antes/Después, aparecerán
              aquí.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[600px]">
              <thead className="border-b border-white/10 text-xs text-[#897F6B] uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Alumno</th>
                  <th className="py-3 px-4">Modelo</th>
                  <th className="py-3 px-4">Fase Lunar</th>
                  <th className="py-3 px-4">Fecha</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {practices.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-4 px-4 font-bold text-white">
                      <div>
                        {p.model?.user?.fullName || "Alumna"}
                        <span className="block text-xs font-normal text-gray-400">
                          {p.model?.user?.email}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-xs text-gray-300">
                      <span className="bg-[#C9A45C]/10 text-[#C9A45C] border border-[#C9A45C]/20 px-2.5 py-1 rounded-full font-medium">
                        {p.model?.modelName} · Corte {p.cutNumber}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-xs text-gray-400">
                      {p.lunarPhase || "Cuarto Creciente"}
                    </td>
                    <td className="py-4 px-4 text-xs text-gray-400">
                      {p.submittedAt
                        ? new Date(p.submittedAt).toLocaleDateString()
                        : "Reciente"}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => setSelectedCut(p)}
                        className="bg-[#C9A45C] hover:bg-[#b08e49] text-black px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center space-x-1.5 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspeccionar</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Inspección */}
      <CutReviewModal
        cut={selectedCut}
        onClose={() => setSelectedCut(null)}
        onReviewed={fetchCuts}
      />
    </div>
  );
}
