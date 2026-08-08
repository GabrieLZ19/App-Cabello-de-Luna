import React from "react";
import {
  Upload as UploadIcon,
  CheckCircle as CheckCircleIcon,
  Video as VideoIcon,
} from "lucide-react";

interface Step1Props {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  onFileUpload: (file: File) => void;
  parsing: boolean;
  parseSuccess: string;
}

const Upload: any = UploadIcon;
const CheckCircle: any = CheckCircleIcon;
const Video: any = VideoIcon;

export function Step1GeneralInfo({
  formData,
  setFormData,
  onFileUpload,
  parsing,
  parseSuccess,
}: Step1Props) {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* File Uploader Container */}
      <div className="p-4 sm:p-6 border-dashed border-2 border-[#C9A45C]/40 bg-[#1A140E] rounded-2xl space-y-4 shadow-inner">
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#C9A45C]/15 border border-[#C9A45C] flex items-center justify-center text-[#C9A45C] shrink-0">
            <Upload className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-white">
              Cargar Archivo de Clase (.pdf, .md, .txt)
            </h3>
            <p className="text-[11px] sm:text-xs text-[#B0A894] mt-0.5">
              Subí el documento oficial para autocompletar los pasos.
            </p>
          </div>
        </div>

        <input
          type="file"
          accept=".pdf,.md,.txt"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              onFileUpload(e.target.files[0]);
            }
          }}
          className="block w-full text-xs text-gray-400 file:mr-2 sm:file:mr-4 file:py-2 file:px-3 sm:file:py-2.5 sm:file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#C9A45C] file:text-black hover:file:bg-[#b5924d] cursor-pointer"
        />

        {parsing && (
          <div className="flex items-center space-x-2 text-xs text-[#C9A45C] font-bold animate-pulse">
            <span>Escaneando documento y procesando secciones...</span>
          </div>
        )}

        {parseSuccess && (
          <div className="flex items-center space-x-2 text-xs text-green-400 bg-green-500/10 p-3 rounded-xl border border-green-500/30">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{parseSuccess}</span>
          </div>
        )}
      </div>

      {/* Metadata Panel */}
      <div className="bg-[#15100A] p-4 sm:p-6 rounded-2xl border border-white/10 space-y-4 sm:space-y-5 shadow-xl">
        <h3 className="text-xs font-bold text-[#C9A45C] uppercase tracking-wider">
          Datos de Identificación del Curso
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-xs text-[#B0A894] font-medium mb-1.5">
              Nombre del Módulo
            </label>
            <input
              type="text"
              value={formData.moduleName}
              onChange={(e) =>
                setFormData((prev: any) => ({
                  ...prev,
                  moduleName: e.target.value,
                }))
              }
              placeholder="Ej: Módulo 1: Fundamentos de Tricología"
              className="w-full bg-[#0C0A07] border border-white/10 rounded-xl p-3 text-xs text-white focus:border-[#C9A45C] outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs text-[#B0A894] font-medium mb-1.5">
              Título de la Clase
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev: any) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Ej: Clase 1: Introducción a la Fibra Capilar"
              className="w-full bg-[#0C0A07] border border-white/10 rounded-xl p-3 text-xs text-white focus:border-[#C9A45C] outline-none transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          <div>
            <label className="block text-[11px] sm:text-xs text-[#B0A894] font-medium mb-1.5">
              Mes del Programa
            </label>
            <input
              type="number"
              value={formData.month}
              onChange={(e) =>
                setFormData((prev: any) => ({
                  ...prev,
                  month: Number(e.target.value),
                }))
              }
              className="w-full bg-[#0C0A07] border border-white/10 rounded-xl p-3 text-xs text-white focus:border-[#C9A45C] outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] sm:text-xs text-[#B0A894] font-medium mb-1.5">
              Semana
            </label>
            <input
              type="number"
              value={formData.week}
              onChange={(e) =>
                setFormData((prev: any) => ({
                  ...prev,
                  week: Number(e.target.value),
                }))
              }
              className="w-full bg-[#0C0A07] border border-white/10 rounded-xl p-3 text-xs text-white focus:border-[#C9A45C] outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] sm:text-xs text-[#B0A894] font-medium mb-1.5">
              Duración (Min)
            </label>
            <input
              type="number"
              value={formData.totalDurationMinutes}
              onChange={(e) =>
                setFormData((prev: any) => ({
                  ...prev,
                  totalDurationMinutes: Number(e.target.value),
                }))
              }
              className="w-full bg-[#0C0A07] border border-white/10 rounded-xl p-3 text-xs text-white focus:border-[#C9A45C] outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] sm:text-xs text-[#B0A894] font-medium mb-1.5">
              Nivel
            </label>
            <input
              type="text"
              value={formData.level}
              onChange={(e) =>
                setFormData((prev: any) => ({ ...prev, level: e.target.value }))
              }
              className="w-full bg-[#0C0A07] border border-white/10 rounded-xl p-3 text-xs text-white focus:border-[#C9A45C] outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-xs text-[#B0A894] font-medium mb-1.5">
              Fecha de liberación (sábado recomendado)
            </label>
            <input
              type="datetime-local"
              value={formData.releaseDate || ""}
              onChange={(e) =>
                setFormData((prev: any) => ({
                  ...prev,
                  releaseDate: e.target.value,
                }))
              }
              className="w-full bg-[#0C0A07] border border-white/10 rounded-xl p-3 text-xs text-white focus:border-[#C9A45C] outline-none"
            />
            <p className="text-[10px] text-gray-500 mt-1">
              Si queda en borrador, el sistema la publica automáticamente al
              llegar esta fecha.
            </p>
          </div>
          <div>
            <label className="block text-xs text-[#B0A894] font-medium mb-1.5">
              Estado de publicación
            </label>
            <select
              value={formData.status || "DRAFT"}
              onChange={(e) =>
                setFormData((prev: any) => ({
                  ...prev,
                  status: e.target.value,
                }))
              }
              className="w-full bg-[#0C0A07] border border-white/10 rounded-xl p-3 text-xs text-white focus:border-[#C9A45C] outline-none"
            >
              <option value="DRAFT">Borrador (programada)</option>
              <option value="PUBLISHED">Publicada</option>
              <option value="INACTIVE">Inactiva</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pt-2">
          <div>
            <label className="block text-xs text-[#B0A894] font-medium mb-1.5">
              Profesor / Mentor IA Asignado
            </label>
            <input
              type="text"
              value={formData.instructorName}
              onChange={(e) =>
                setFormData((prev: any) => ({
                  ...prev,
                  instructorName: e.target.value,
                }))
              }
              placeholder="Ej: Especialista en Tricología Cosmética"
              className="w-full bg-[#0C0A07] border border-white/10 rounded-xl p-3 text-xs text-white focus:border-[#C9A45C] outline-none"
            />
          </div>

          <div className="flex items-center justify-between bg-black/40 p-3.5 rounded-xl border border-white/10 shadow-inner">
            <div className="flex items-center space-x-3">
              <div
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-all shrink-0 ${
                  formData.hasVideo
                    ? "bg-[#C9A45C]/20 border border-[#C9A45C] text-[#C9A45C]"
                    : "bg-white/5 border border-white/10 text-gray-500"
                }`}
              >
                <Video className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">
                  Modalidad Video
                </span>
                <span className="text-[10px] sm:text-[11px] text-gray-400">
                  {formData.hasVideo
                    ? "Habilita reproductor en app"
                    : "Solo lección en texto"}
                </span>
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={formData.hasVideo}
              onClick={() =>
                setFormData((prev: any) => ({
                  ...prev,
                  hasVideo: !prev.hasVideo,
                }))
              }
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                formData.hasVideo ? "bg-[#C9A45C]" : "bg-gray-800"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-black shadow-lg ring-0 transition duration-200 ease-in-out ${
                  formData.hasVideo
                    ? "translate-x-5 bg-black"
                    : "translate-x-0 bg-gray-400"
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
