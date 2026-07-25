"use client";

import React, { useEffect, useState } from "react";
import LinkRaw from "next/link";
import {
  BookOpen as BookOpenIcon,
  Plus as PlusIcon,
  Search as SearchIcon,
  Video as VideoIcon,
  FileText as FileTextIcon,
  Clock as ClockIcon,
  Edit2 as Edit2Icon,
  Trash2 as Trash2Icon,
  Bookmark as BookmarkIcon,
} from "lucide-react";
import CustomAlert, { AlertType } from "../../components/CustomAlert";
import {
  getTheoreticalModules,
  deleteTheoreticalClass,
} from "@/services/classService";

const Link: any = LinkRaw;
const BookOpen: any = BookOpenIcon;
const Plus: any = PlusIcon;
const Search: any = SearchIcon;
const Video: any = VideoIcon;
const FileText: any = FileTextIcon;
const Clock: any = ClockIcon;
const Edit2: any = Edit2Icon;
const Trash2: any = Trash2Icon;
const Bookmark: any = BookmarkIcon;

export default function ClassesPage() {
  const [modulesList, setModulesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [savedDraft, setSavedDraft] = useState<any | null>(null);

  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean;
    type: AlertType;
    title: string;
    message: string;
    confirmText?: string;
    onConfirm?: () => void;
    showCancel?: boolean;
  }>({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
  });

  const fetchClasses = async () => {
    try {
      const data = await getTheoreticalModules();
      setModulesList(data);
    } catch (err) {
      console.error("Error al obtener clases:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();

    try {
      const draftLocal = localStorage.getItem("new_class_saved_draft");
      const draftSession = sessionStorage.getItem("new_class_active_draft");
      const draft = draftLocal || draftSession;
      if (draft) {
        setSavedDraft(JSON.parse(draft));
      }
    } catch (e) {
      console.error("Error al verificar borrador guardado:", e);
    }
  }, []);

  const handleDiscardDraft = () => {
    try {
      localStorage.removeItem("new_class_saved_draft");
      sessionStorage.removeItem("new_class_active_draft");
      setSavedDraft(null);
    } catch (e) {}
  };

  const handleDeleteClass = (id: string, title: string) => {
    setAlertConfig({
      isOpen: true,
      type: "danger",
      title: "¿ELIMINAR LECCIÓN TEÓRICA?",
      message: `¿Estás seguro de que deseas eliminar permanentemente la clase "${title}"?`,
      confirmText: "Sí, Eliminar Clase",
      showCancel: true,
      onConfirm: async () => {
        try {
          const success = await deleteTheoreticalClass(id);

          if (success) {
            await fetchClasses();
            setTimeout(() => {
              setAlertConfig({
                isOpen: true,
                type: "success",
                title: "Clase Eliminada Con Éxito",
                message: `La lección "${title}" fue eliminada correctamente.`,
                showCancel: false,
              });
            }, 100);
          }
        } catch (err) {
          console.error("Error eliminando clase:", err);
        }
      },
    });
  };

  const filteredModules = modulesList.filter(
    (m) =>
      m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.moduleName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      <CustomAlert
        isOpen={alertConfig.isOpen}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        confirmText={alertConfig.confirmText}
        showCancel={alertConfig.showCancel}
        onConfirm={alertConfig.onConfirm}
        onClose={() => setAlertConfig((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Gestión de Clases & Lecciones
          </h1>
          <p className="text-[#B0A894] text-xs mt-1">
            Administración completa de módulos y contenido teórico para la app.
          </p>
        </div>

        <Link
          href="/classes/new"
          className="w-full sm:w-auto bg-[#C9A45C] hover:bg-[#b5924d] text-black font-bold px-5 py-3 rounded-xl text-xs flex items-center justify-center space-x-2 transition-all shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span>Crear Nueva Clase</span>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-4 top-3.5" />
        <input
          type="text"
          placeholder="Buscar clase por título o módulo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[#15100A] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-xs text-white placeholder-gray-500 focus:border-[#C9A45C] outline-none"
        />
      </div>

      {/* Tarjeta de Borrador Guardado */}
      {savedDraft && (
        <div className="bg-[#1A140E] border-2 border-[#C9A45C]/50 p-4 sm:p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-start space-x-3 sm:space-x-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#C9A45C]/15 border border-[#C9A45C] flex items-center justify-center text-[#C9A45C] shrink-0 mt-0.5 sm:mt-0">
              <Bookmark className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] sm:text-xs font-bold text-[#C9A45C] uppercase tracking-wider bg-[#C9A45C]/20 px-2.5 py-0.5 rounded border border-[#C9A45C]/40">
                  Borrador Guardado
                </span>
                <span className="text-[11px] text-gray-400">
                  {savedDraft.moduleName || "Módulo Sin Título"}
                </span>
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-white mt-1">
                {savedDraft.title || "Clase en proceso de creación..."}
              </h4>
              <p className="text-[11px] sm:text-xs text-[#B0A894] mt-0.5">
                Mes {savedDraft.month || 1} · Semana {savedDraft.week || 1} ·{" "}
                {savedDraft.chapters?.length || 0} capítulos
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 w-full md:w-auto md:flex md:items-center md:space-x-3 pt-2 md:pt-0 border-t md:border-t-0 border-white/10">
            <button
              onClick={handleDiscardDraft}
              className="w-full md:w-auto text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 px-3 py-2.5 sm:px-4 rounded-xl text-xs font-bold transition-all text-center"
            >
              Descartar
            </button>
            <Link
              href="/classes/new"
              className="w-full md:w-auto bg-[#C9A45C] hover:bg-[#b5924d] text-black font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center space-x-2 transition-all shadow-lg text-center"
            >
              <Edit2 className="w-4 h-4" />
              <span>Continuar</span>
            </Link>
          </div>
        </div>
      )}

      {/* Main Classes Container */}
      <div className="glass-panel p-4 sm:p-6">
        <h3 className="text-xs font-bold text-[#C9A45C] uppercase tracking-wider mb-4 flex items-center space-x-2">
          <BookOpen className="w-4 h-4 text-[#C9A45C]" />
          <span>Lecciones Publicadas ({filteredModules.length})</span>
        </h3>

        {loading ? (
          <div className="space-y-3 py-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 bg-white/5 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : filteredModules.length === 0 ? (
          <div className="text-center py-12 bg-black/30 rounded-xl border border-white/10">
            <BookOpen className="w-8 h-8 text-gray-500 mx-auto mb-2" />
            <p className="text-xs text-gray-400">
              No hay clases teóricas registradas.
            </p>
          </div>
        ) : (
          <>
            {/* VISTA MÓVIL (CARDS) - Visibles solo en < md */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {filteredModules.map((m) => (
                <div
                  key={m.id}
                  className="bg-[#15100A] border border-white/10 rounded-2xl p-4 space-y-3 shadow-lg"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-white text-sm leading-snug">
                        {m.title}
                      </h4>
                      <p className="text-[11px] text-[#C9A45C] font-semibold mt-0.5">
                        {m.moduleName}
                      </p>
                    </div>
                    {m.status === "DRAFT" ? (
                      <span className="bg-[#C9A45C]/15 border border-[#C9A45C]/40 text-[#C9A45C] px-2 py-0.5 rounded-full text-[9px] font-bold shrink-0">
                        BORRADOR
                      </span>
                    ) : m.status === "INACTIVE" ? (
                      <span className="bg-red-500/10 border border-red-500/30 text-red-400 px-2 py-0.5 rounded-full text-[9px] font-bold shrink-0">
                        INACTIVO
                      </span>
                    ) : (
                      <span className="bg-green-500/10 border border-green-500/30 text-green-400 px-2 py-0.5 rounded-full text-[9px] font-bold shrink-0">
                        PUBLICADO
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5 text-gray-400">
                    <span className="text-[11px]">
                      Mes {m.month} · Sem {m.week}
                    </span>

                    <div className="flex items-center space-x-2">
                      {m.hasVideo ? (
                        <span className="bg-green-500/10 border border-green-500/30 text-green-400 px-2 py-0.5 rounded-full text-[9px] font-bold flex items-center space-x-1">
                          <Video className="w-3 h-3" />
                          <span>VIDEO</span>
                        </span>
                      ) : (
                        <span className="bg-blue-500/10 border border-blue-500/30 text-blue-300 px-2 py-0.5 rounded-full text-[9px] font-bold flex items-center space-x-1">
                          <FileText className="w-3 h-3" />
                          <span>LECTURA</span>
                        </span>
                      )}

                      <span className="flex items-center space-x-1 text-[11px]">
                        <Clock className="w-3 h-3 text-[#C9A45C]" />
                        <span>{m.totalDurationMinutes || 45}m</span>
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                    <Link
                      href={`/classes/${m.id}`}
                      className="w-full bg-white/10 hover:bg-[#C9A45C] hover:text-black text-white py-2 rounded-xl font-bold transition-all text-xs flex items-center justify-center space-x-1.5"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Editar</span>
                    </Link>

                    <button
                      onClick={() => handleDeleteClass(m.id, m.title)}
                      className="w-full bg-red-500/20 hover:bg-red-500 hover:text-white text-red-300 py-2 rounded-xl font-bold transition-all text-xs flex items-center justify-center space-x-1.5 border border-red-500/30"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Eliminar</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* VISTA DESKTOP (TABLA) - Visible solo en >= md */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-xs text-gray-400 uppercase tracking-wider">
                    <th className="pb-3">Lección</th>
                    <th className="pb-3">Módulo</th>
                    <th className="pb-3">Estado</th>
                    <th className="pb-3">Modalidad</th>
                    <th className="pb-3">Duración</th>
                    <th className="pb-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredModules.map((m) => (
                    <tr key={m.id} className="hover:bg-white/5 transition-all">
                      <td className="py-4">
                        <div className="font-bold text-white text-xs">
                          {m.title}
                        </div>
                        <div className="text-[11px] text-gray-400">
                          Mes {m.month} · Semana {m.week}
                        </div>
                      </td>
                      <td className="py-4 text-xs text-gray-[#C9A45C] font-semibold">
                        <div>{m.moduleName}</div>
                        {Array.isArray(m.chaptersJson) &&
                          m.chaptersJson.length > 0 && (
                            <div className="text-[10px] text-gray-400 font-normal mt-0.5">
                              {m.chaptersJson.length}{" "}
                              {m.chaptersJson.length === 1
                                ? "capítulo"
                                : "capítulos"}
                            </div>
                          )}
                      </td>
                      <td className="py-4 text-xs">
                        {m.status === "DRAFT" ? (
                          <span className="bg-[#C9A45C]/15 border border-[#C9A45C]/40 text-[#C9A45C] px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center space-x-1 w-fit">
                            <Bookmark className="w-3 h-3" />
                            <span>BORRADOR</span>
                          </span>
                        ) : m.status === "INACTIVE" ? (
                          <span className="bg-red-500/10 border border-red-500/30 text-red-400 px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center space-x-1 w-fit">
                            <span>INACTIVO</span>
                          </span>
                        ) : (
                          <span className="bg-green-500/10 border border-green-500/30 text-green-400 px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center space-x-1 w-fit">
                            <span>PUBLICADO</span>
                          </span>
                        )}
                      </td>
                      <td className="py-4 text-xs">
                        {m.hasVideo ? (
                          <span className="bg-green-500/10 border border-green-500/30 text-green-400 px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center space-x-1 w-fit">
                            <Video className="w-3 h-3" />
                            <span>VIDEO</span>
                          </span>
                        ) : (
                          <span className="bg-blue-500/10 border border-blue-500/30 text-blue-300 px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center space-x-1 w-fit">
                            <FileText className="w-3 h-3" />
                            <span>LECTURA</span>
                          </span>
                        )}
                      </td>
                      <td className="py-4 text-xs text-gray-300">
                        <span className="flex items-center space-x-1 text-gray-400">
                          <Clock className="w-3.5 h-3.5 text-[#C9A45C]" />
                          <span>{m.totalDurationMinutes || 45} min</span>
                        </span>
                      </td>
                      <td className="py-4 text-xs text-right space-x-2">
                        <Link
                          href={`/classes/${m.id}`}
                          className="bg-white/10 hover:bg-[#C9A45C] hover:text-black text-white px-3 py-1.5 rounded-lg font-bold transition-all text-[11px] inline-flex items-center space-x-1"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Editar</span>
                        </Link>
                        <button
                          onClick={() => handleDeleteClass(m.id, m.title)}
                          className="bg-red-500/20 hover:bg-red-500 hover:text-white text-red-300 px-3 py-1.5 rounded-lg font-bold transition-all text-[11px] inline-flex items-center space-x-1 border border-red-500/30"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Eliminar</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
