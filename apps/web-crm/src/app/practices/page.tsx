"use client";

import React, { useState } from "react";
import { Scissors as ScissorsIcon } from "lucide-react";

const Scissors: any = ScissorsIcon;

export default function PracticesPage() {
  const [practices] = useState<any[]>([]);

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      <div className="flex justify-between items-center bg-[#15100A] p-4 sm:p-6 rounded-2xl border border-white/10">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white">
            Cola de Validación de Prácticas
          </h2>
          <p className="text-xs text-[#B0A894] mt-1">
            Revisión de fichas clínicas de corte enviadas por estudiantes
          </p>
        </div>
      </div>

      <div className="glass-panel p-4 sm:p-6">
        {practices.length === 0 ? (
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
            <table className="w-full text-left text-sm min-w-[500px]">
              <thead className="border-b border-white/10 text-xs text-[#897F6B] uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Alumno</th>
                  <th className="py-3 px-4">Modelo</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {practices.map((p) => (
                  <tr key={p.id}>
                    <td className="py-4 px-4 font-bold text-white">
                      {p.studentName}
                    </td>
                    <td className="py-4 px-4 text-xs text-gray-300">
                      {p.modelName}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button className="bg-green-500/20 text-green-400 px-3 py-1 rounded text-xs font-bold">
                        Aprobar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
