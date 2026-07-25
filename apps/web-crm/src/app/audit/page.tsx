"use client";

import React from "react";
import { FileText as FileTextIcon } from "lucide-react";

const FileText: any = FileTextIcon;

export default function AuditPage() {
  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      <div className="flex justify-between items-center bg-[#15100A] p-4 sm:p-6 rounded-2xl border border-white/10">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white">
            Log de Actividad y Auditoría
          </h2>
          <p className="text-xs text-[#B0A894] mt-1">
            Registro inmutable de acciones en el sistema
          </p>
        </div>
      </div>

      <div className="glass-panel p-6 text-center py-12">
        <FileText className="w-8 h-8 text-gray-500 mx-auto mb-2" />
        <p className="text-sm font-semibold text-[#B0A894]">
          No hay eventos registrados en el log de auditoría.
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Las acciones de usuarios y del Sistema IA quedarán registradas
          automáticamente.
        </p>
      </div>
    </div>
  );
}
