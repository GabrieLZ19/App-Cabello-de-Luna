"use client";

import React, { useState } from "react";
import {
  X as XIcon,
  CheckCircle2 as CheckCircle2Icon,
  AlertTriangle as AlertTriangleIcon,
  User as UserIcon,
  Calendar as CalendarIcon,
  FileText as FileTextIcon,
  Loader2 as Loader2Icon,
  Maximize2 as Maximize2Icon,
} from "lucide-react";
import { PendingCut, reviewCut } from "@/services/practicesService";

interface CutReviewModalProps {
  cut: PendingCut | null;
  onClose: () => void;
  onReviewed: () => void;
}

// Asignar a constantes con nombres claros para usar en el JSX
const X: any = XIcon;
const CheckCircle2: any = CheckCircle2Icon;
const AlertTriangle: any = AlertTriangleIcon;
const User: any = UserIcon;
const Calendar: any = CalendarIcon;
const FileText: any = FileTextIcon;
const Loader2: any = Loader2Icon;
const Maximize2: any = Maximize2Icon;

export function CutReviewModal({
  cut,
  onClose,
  onReviewed,
}: CutReviewModalProps) {
  const [comments, setComments] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Estado para el visor de imagen a pantalla completa
  const [fullscreenImage, setFullscreenImage] = useState<{
    url: string;
    label: string;
  } | null>(null);

  if (!cut) return null;

  const handleAction = async (status: "APPROVED" | "CORRECTION_REQUIRED") => {
    setSubmitting(true);
    setErrorMsg(null);
    try {
      await reviewCut(
        cut.id,
        status,
        comments.trim() ||
          (status === "APPROVED"
            ? "Técnica de corte y cauterización aprobadas."
            : "Favor de revisar la ficha técnica o enviar nuevas evidencias."),
      );
      onReviewed();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Ocurrió un error al procesar.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
        <div className="bg-[#15100A] border border-[#C9A45C]/30 rounded-2xl max-w-3xl w-full p-6 space-y-6 shadow-2xl my-8">
          {/* Modal Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#C9A45C] bg-[#C9A45C]/10 px-3 py-1 rounded-full border border-[#C9A45C]/20">
                {cut.model.modelName} · Corte {cut.cutNumber}
              </span>
              <h3 className="text-xl font-bold text-white mt-2">
                Revisión de Evidencia
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl">
              {errorMsg}
            </div>
          )}

          {/* Datos de la Alumna */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-black/30 p-4 rounded-xl border border-white/5 text-xs text-[#B0A894]">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-[#C9A45C]" />
              <div>
                <span className="text-gray-400 block">Estudiante:</span>
                <span className="text-white font-semibold">
                  {cut.model.user.fullName}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-[#C9A45C]" />
              <div>
                <span className="text-gray-400 block">Fecha de Envío:</span>
                <span className="text-white font-semibold">
                  {new Date(cut.submittedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Fotos Comparativas Antes / Después con Zoom Click */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Foto Antes */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-[#897F6B] uppercase tracking-wider">
                Foto Antes
              </span>
              <div
                onClick={() =>
                  cut.evidence?.photoBeforeUrl &&
                  setFullscreenImage({
                    url: cut.evidence.photoBeforeUrl,
                    label: "Foto Antes · " + cut.model.user.fullName,
                  })
                }
                className="h-56 bg-black/50 rounded-xl overflow-hidden border border-white/10 relative group cursor-pointer"
              >
                <img
                  src={cut.evidence?.photoBeforeUrl}
                  alt="Antes"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2 text-white text-xs font-semibold">
                  <Maximize2 className="w-4 h-4 text-[#C9A45C]" />
                  <span>Ver Completa</span>
                </div>
              </div>
            </div>

            {/* Foto Después */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-[#897F6B] uppercase tracking-wider">
                Foto Después
              </span>
              <div
                onClick={() =>
                  cut.evidence?.photoAfterUrl &&
                  setFullscreenImage({
                    url: cut.evidence.photoAfterUrl,
                    label: "Foto Después · " + cut.model.user.fullName,
                  })
                }
                className="h-56 bg-black/50 rounded-xl overflow-hidden border border-white/10 relative group cursor-pointer"
              >
                <img
                  src={cut.evidence?.photoAfterUrl}
                  alt="Después"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2 text-white text-xs font-semibold">
                  <Maximize2 className="w-4 h-4 text-[#C9A45C]" />
                  <span>Ver Completa</span>
                </div>
              </div>
            </div>
          </div>

          {/* Ficha Técnica */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-[#897F6B] uppercase tracking-wider flex items-center space-x-1">
              <FileText className="w-3.5 h-3.5 text-[#C9A45C]" />
              <span>Ficha Técnica y Diagnóstico</span>
            </span>
            <p className="text-xs text-gray-300 bg-black/40 p-3.5 rounded-xl border border-white/5 leading-relaxed min-h-[60px]">
              {cut.evidence?.technicalSheetText || "Sin ficha redactada."}
            </p>
          </div>

          {/* Campo para Feedback del Instructor */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#897F6B] uppercase tracking-wider block">
              Observaciones / Retroalimentación
            </label>
            <textarea
              rows={3}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Escribe recomendaciones para la estudiante..."
              className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#C9A45C] transition-colors resize-none"
            />
          </div>

          {/* Botones de Evaluación */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              disabled={submitting}
              onClick={() => handleAction("CORRECTION_REQUIRED")}
              className="flex-1 flex items-center justify-center space-x-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 py-2.5 px-4 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4" />
                  <span>Solicitar Corrección</span>
                </>
              )}
            </button>

            <button
              disabled={submitting}
              onClick={() => handleAction("APPROVED")}
              className="flex-1 flex items-center justify-center space-x-2 bg-[#C9A45C] hover:bg-[#b08e49] text-black py-2.5 px-4 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Aprobar Corte</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Visor Fullscreen de Imagen (Lightbox) */}
      {fullscreenImage && (
        <div
          onClick={() => setFullscreenImage(null)}
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 cursor-zoom-out"
        >
          <div className="absolute top-4 right-4 flex items-center space-x-3">
            <span className="text-xs text-gray-400 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
              {fullscreenImage.label}
            </span>
            <button
              onClick={() => setFullscreenImage(null)}
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <img
            src={fullscreenImage.url}
            alt="Visor Completo"
            className="max-w-full max-h-[85vh] object-contain rounded-xl border border-white/10 shadow-2xl"
          />
          <p className="text-xs text-gray-400 mt-4">
            Haz clic en cualquier parte para cerrar la vista previa
          </p>
        </div>
      )}
    </>
  );
}
