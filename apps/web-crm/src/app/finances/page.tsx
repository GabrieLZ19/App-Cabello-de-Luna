"use client";

import React from "react";
import { DollarSign as DollarSignIcon, Lock as LockIcon } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const DollarSign: any = DollarSignIcon;
const Lock: any = LockIcon;

export default function FinancesPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  if (!isAdmin) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[70vh]">
        <div className="bg-[#15100A] border border-red-500/30 rounded-2xl p-8 max-w-md text-center space-y-4">
          <Lock className="w-12 h-12 text-red-400 mx-auto" />
          <h2 className="text-xl font-bold text-white">Acceso Restringido</h2>
          <p className="text-xs text-[#B0A894]">
            Tu rol como Asistente ({user?.name}) no posee permisos para
            consultar la información financiera del instituto.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center bg-[#15100A] p-6 rounded-2xl border border-white/10">
        <div>
          <h2 className="text-xl font-bold text-white">
            Finanzas y Recaudación de Franquicias
          </h2>
          <p className="text-xs text-[#B0A894] mt-1">
            Registro contable de matriculaciones y colegiaturas{" "}
          </p>
        </div>
      </div>

      <div className="glass-panel p-6 text-center py-12">
        <DollarSign className="w-8 h-8 text-[#C9A45C] mx-auto mb-2" />
        <p className="text-sm font-semibold text-[#B0A894]">
          No hay transacciones registradas en la base de datos.
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Los pagos confirmados de los alumnos aparecerán en este reporte
          contable.
        </p>
      </div>
    </div>
  );
}
