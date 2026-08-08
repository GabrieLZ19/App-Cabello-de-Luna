"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft as ArrowLeftIcon,
  BookOpen as BookOpenIcon,
  Scissors as ScissorsIcon,
} from "lucide-react";
import {
  getStudentProgress,
  StudentProgressResponse,
} from "@/services/progressService";
import { PageSkeleton } from "@/components/PageSkeleton";

const ArrowLeft: any = ArrowLeftIcon;
const BookOpen: any = BookOpenIcon;
const Scissors: any = ScissorsIcon;

const statusColor: Record<string, string> = {
  COMPLETED: "text-green-400 bg-green-500/10 border-green-500/30",
  AVAILABLE: "text-[#C9A45C] bg-[#C9A45C]/10 border-[#C9A45C]/30",
  IN_PROGRESS: "text-blue-300 bg-blue-500/10 border-blue-500/30",
  LOCKED: "text-gray-500 bg-white/5 border-white/10",
  APPROVED: "text-green-400 bg-green-500/10 border-green-500/30",
  IN_REVIEW: "text-[#C9A45C] bg-[#C9A45C]/10 border-[#C9A45C]/30",
  CORRECTION_REQUIRED: "text-red-400 bg-red-500/10 border-red-500/30",
  PENDING: "text-gray-500 bg-white/5 border-white/10",
};

export default function StudentProgressPage() {
  const params = useParams();
  const studentId = params.id as string;
  const [data, setData] = useState<StudentProgressResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const progress = await getStudentProgress(studentId);
        setData(progress);
      } catch (err: any) {
        setError(err.message || "Error cargando progreso");
      } finally {
        setLoading(false);
      }
    }
    if (studentId) load();
  }, [studentId]);

  if (loading) {
    return (
      <div className="p-4 sm:p-6 md:p-8 space-y-6">
        <div className="h-8 bg-white/10 rounded-xl w-48 animate-pulse" />
        <PageSkeleton rows={6} showCards />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 space-y-4">
        <Link
          href="/students"
          className="inline-flex items-center gap-2 text-xs text-[#C9A45C]"
        >
          <ArrowLeft className="w-4 h-4" /> Volver
        </Link>
        <p className="text-red-400 text-sm">{error || "Sin datos"}</p>
      </div>
    );
  }

  const cutGrid = Array.from({ length: 10 }, (_, modelIdx) => {
    const modelNum = modelIdx + 1;
    const model = data.practice.models.find((m) => m.modelNumber === modelNum);
    return {
      modelNumber: modelNum,
      cuts: Array.from({ length: 7 }, (_, cutIdx) => {
        const cutNum = cutIdx + 1;
        const cut = model?.cuts.find((c) => c.cutNumber === cutNum);
        return { cutNumber: cutNum, status: cut?.status || "PENDING" };
      }),
    };
  });

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/students"
            className="inline-flex items-center gap-2 text-xs text-[#C9A45C] mb-3"
          >
            <ArrowLeft className="w-4 h-4" /> Alumnos
          </Link>
          <h1 className="text-2xl font-bold text-white">{data.fullName}</h1>
          <p className="text-xs text-[#B0A894] mt-1">{data.email}</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-full border border-[#C9A45C]/30 bg-[#C9A45C]/10 text-[#C9A45C] font-semibold">
            Fase {data.currentPhase}
          </span>
          <span className="px-3 py-1.5 rounded-full border border-white/10 bg-black/30 text-white font-semibold">
            Mes {data.courseMonth} / {data.totalMonths}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="glass-panel p-5">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-4 h-4 text-[#C9A45C]" />
            <span className="text-xs font-semibold text-[#B0A894]">
              TEORÍA
            </span>
          </div>
          <p className="text-3xl font-bold text-white">
            {data.theory.percent}%
          </p>
          <p className="text-xs text-[#B0A894] mt-1">
            {data.theory.completed} / {data.theory.total} módulos
          </p>
        </div>
        <div className="glass-panel p-5">
          <div className="flex items-center gap-2 mb-2">
            <Scissors className="w-4 h-4 text-[#C9A45C]" />
            <span className="text-xs font-semibold text-[#B0A894]">
              PRÁCTICA
            </span>
          </div>
          <p className="text-3xl font-bold text-white">
            {data.practice.percent}%
          </p>
          <p className="text-xs text-[#B0A894] mt-1">
            {data.practice.approvedCuts} / {data.practice.totalCuts} cortes
          </p>
        </div>
      </div>

      <section className="glass-panel p-5 space-y-4">
        <h2 className="text-sm font-bold text-white">Timeline teórico</h2>
        {data.theory.modules.length === 0 ? (
          <p className="text-xs text-[#B0A894]">Sin módulos publicados.</p>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {data.theory.modules.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between gap-3 bg-black/30 border border-white/5 rounded-xl px-3 py-2.5"
              >
                <div>
                  <p className="text-xs text-white font-semibold">
                    Mes {m.month} · Sem {m.week} — {m.title}
                  </p>
                </div>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-lg border ${
                    statusColor[m.status] || statusColor.LOCKED
                  }`}
                >
                  {m.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="glass-panel p-5 space-y-4">
        <h2 className="text-sm font-bold text-white">
          Matriz 10 modelos × 7 cortes
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[640px]">
            <thead>
              <tr className="text-[#897F6B]">
                <th className="text-left py-2 pr-2 font-medium">Modelo</th>
                {Array.from({ length: 7 }, (_, i) => (
                  <th key={i} className="py-2 font-medium">
                    C{i + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cutGrid.map((row) => (
                <tr key={row.modelNumber} className="border-t border-white/5">
                  <td className="py-2 pr-2 text-white font-semibold">
                    M{row.modelNumber < 10 ? `0${row.modelNumber}` : row.modelNumber}
                  </td>
                  {row.cuts.map((c) => (
                    <td key={c.cutNumber} className="py-2 text-center">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded border text-[9px] font-bold ${
                          statusColor[c.status] || statusColor.PENDING
                        }`}
                      >
                        {c.status === "APPROVED"
                          ? "OK"
                          : c.status === "IN_REVIEW"
                            ? "REV"
                            : c.status === "CORRECTION_REQUIRED"
                              ? "COR"
                              : "—"}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
