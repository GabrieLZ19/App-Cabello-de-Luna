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
  Video as VideoIcon,
} from "lucide-react";
import { PendingCut, reviewCut } from "@/services/practicesService";

interface CutReviewModalProps {
  cut: PendingCut | null;
  onClose: () => void;
  onReviewed: () => void;
}

const X: any = XIcon;
const CheckCircle2: any = CheckCircle2Icon;
const AlertTriangle: any = AlertTriangleIcon;
const User: any = UserIcon;
const Calendar: any = CalendarIcon;
const FileText: any = FileTextIcon;
const Loader2: any = Loader2Icon;
const Maximize2: any = Maximize2Icon;
const Video: any = VideoIcon;

export function CutReviewModal({
  cut,
  onClose,
  onReviewed,
}: CutReviewModalProps) {
  const [comments, setComments] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [fullscreenImage, setFullscreenImage] = useState<{
    url: string;
    label: string;
  } | null>(null);
  const [videoPortrait, setVideoPortrait] = useState<boolean | null>(null);

  React.useEffect(() => {
    setVideoPortrait(null);
  }, [cut?.id, cut?.evidence?.videoOptionalUrl]);

  if (!cut) return null;

  const handleAction = async (status: "APPROVED" | "CORRECTION_REQUIRED") => {
    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await reviewCut(
        cut.id,
        status,
        comments.trim() ||
          (status === "APPROVED"
            ? "Técnica de corte y cauterización aprobadas."
            : "Favor de revisar la ficha técnica o enviar nuevas evidencias."),
      );
      setSuccessMsg(
        status === "APPROVED"
          ? "Corte aprobado. Notificación enviada a la alumna en tiempo real."
          : "Corrección solicitada. Notificación enviada a la alumna en tiempo real.",
      );
      setTimeout(() => {
        onReviewed();
        onClose();
      }, 800);
    } catch (err: any) {
      setErrorMsg(err.message || "Ocurrió un error al procesar.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-5">
        <div className="bg-[#15100A] border border-[#C9A45C]/30 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
          <div className="flex items-start justify-between gap-3 border-b border-white/10 px-5 py-4 shrink-0">
            <div className="min-w-0">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#C9A45C] bg-[#C9A45C]/10 px-2.5 py-1 rounded-full border border-[#C9A45C]/20">
                {cut.model.modelName} · Corte {cut.cutNumber}
              </span>
              <h3 className="text-lg font-bold text-white mt-2">
                Revisión de Evidencia
              </h3>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#B0A894]">
                <span className="inline-flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#C9A45C]" />
                  <span className="text-white font-medium">
                    {cut.model.user.fullName}
                  </span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#C9A45C]" />
                  {new Date(cut.submittedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
            {errorMsg && (
              <div className="p-2.5 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="p-2.5 bg-green-500/10 border border-green-500/30 text-green-400 text-xs rounded-xl">
                {successMsg}
              </div>
            )}

            {/* 1. Fotos Antes / Después */}
            <section className="space-y-2">
              <h4 className="text-[10px] font-bold text-[#897F6B] uppercase tracking-wider">
                Evidencia fotográfica
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    label: "Antes",
                    url: cut.evidence?.photoBeforeUrl,
                  },
                  {
                    label: "Después",
                    url: cut.evidence?.photoAfterUrl,
                  },
                ].map((photo) => (
                  <div key={photo.label} className="space-y-1.5">
                    <span className="text-[10px] font-semibold text-[#B0A894]">
                      Foto {photo.label}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        photo.url &&
                        setFullscreenImage({
                          url: photo.url,
                          label: `Foto ${photo.label} · ${cut.model.user.fullName}`,
                        })
                      }
                      className="relative w-full aspect-[4/5] max-h-52 bg-black/50 rounded-xl overflow-hidden border border-white/10 group text-left"
                    >
                      {photo.url ? (
                        <img
                          src={photo.url}
                          alt={photo.label}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-500">
                          Sin imagen
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-[10px] font-semibold">
                        <Maximize2 className="w-3.5 h-3.5 text-[#C9A45C]" />
                        Ampliar
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* 2. Ficha técnica */}
            <section className="space-y-2">
              <h4 className="text-[10px] font-bold text-[#897F6B] uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#C9A45C]" />
                Ficha técnica
              </h4>
              <p className="text-xs text-gray-300 bg-black/40 p-3.5 rounded-xl border border-white/5 leading-relaxed whitespace-pre-wrap">
                {cut.evidence?.technicalSheetText || "Sin ficha redactada."}
              </p>
            </section>

            {/* 3. Video (si hay) — tamaño según orientación */}
            {cut.evidence?.videoOptionalUrl ? (
              <section className="space-y-2">
                <h4 className="text-[10px] font-bold text-[#897F6B] uppercase tracking-wider flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-[#C9A45C]" />
                  Video opcional
                </h4>
                <div
                  className={`rounded-xl border border-white/10 bg-black overflow-hidden flex items-center justify-center ${
                    videoPortrait === true ? "py-2" : ""
                  }`}
                >
                  <video
                    key={cut.evidence.videoOptionalUrl}
                    src={cut.evidence.videoOptionalUrl}
                    controls
                    playsInline
                    preload="metadata"
                    onLoadedMetadata={(e) => {
                      const el = e.currentTarget;
                      setVideoPortrait(el.videoHeight > el.videoWidth);
                    }}
                    className={
                      videoPortrait === true
                        ? "w-[min(100%,280px)] h-auto max-h-[min(70vh,520px)] object-contain"
                        : videoPortrait === false
                          ? "w-full max-h-[min(50vh,360px)] object-contain"
                          : "w-full max-h-72 object-contain"
                    }
                  />
                </div>
              </section>
            ) : null}

            {/* 4. Observaciones */}
            <section className="space-y-2">
              <label className="text-[10px] font-bold text-[#897F6B] uppercase tracking-wider block">
                Observaciones / Retroalimentación
              </label>
              <textarea
                rows={3}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Recomendaciones para la estudiante..."
                className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#C9A45C] transition-colors resize-none"
              />
            </section>
          </div>

          <div className="shrink-0 border-t border-white/10 px-5 py-3.5 grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-[#120E09]">
            <button
              disabled={submitting}
              onClick={() => handleAction("CORRECTION_REQUIRED")}
              className="flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 py-2.5 px-4 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4" />
                  Solicitar Corrección
                </>
              )}
            </button>
            <button
              disabled={submitting}
              onClick={() => handleAction("APPROVED")}
              className="flex items-center justify-center gap-2 bg-[#C9A45C] hover:bg-[#b08e49] text-black py-2.5 px-4 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Aprobar Corte
                </>
              )}
            </button>
          </div>
        </div>
      </div>

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
        </div>
      )}
    </>
  );
}
