import React from "react";
import {
  BookOpen as BookOpenIcon,
  List as ListIcon,
  Key as KeyIcon,
  FileText as FileTextIcon,
  Layers as LayersIcon,
  Plus as PlusIcon,
  Trash2 as Trash2Icon,
} from "lucide-react";
import { RichTextArea } from "./RichTextArea";

const BookOpen: any = BookOpenIcon;
const List: any = ListIcon;
const Key: any = KeyIcon;
const FileText: any = FileTextIcon;
const Layers: any = LayersIcon;
const Plus: any = PlusIcon;
const Trash2: any = Trash2Icon;

interface Step2Props {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

export function Step2ContentSummary({ formData, setFormData }: Step2Props) {
  const chapters = formData.chapters || [];

  const handleAddChapter = () => {
    const newChap = {
      id: Date.now(),
      title: `Subsección #${chapters.length + 1}`,
      timestamp: "00:00",
      status: "COMPLETED",
      content: "",
    };
    setFormData((prev: any) => ({
      ...prev,
      chapters: [...(prev.chapters || []), newChap],
    }));
  };

  const handleRemoveChapter = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      chapters: (prev.chapters || []).filter((_: any, i: number) => i !== index),
    }));
  };

  const handleUpdateChapter = (index: number, field: string, val: string) => {
    const updated = [...chapters];
    updated[index] = { ...updated[index], [field]: val };
    setFormData((prev: any) => ({
      ...prev,
      chapters: updated,
    }));
  };

  return (
    <div className="bg-[#15100A] p-6 rounded-2xl border border-white/10 space-y-6 shadow-xl">
      <h3 className="text-xs font-bold text-[#C9A45C] uppercase tracking-wider flex items-center space-x-2">
        <BookOpen className="w-4 h-4" />
        <span>2. Introducción, Capítulos, Resumen & Glosario</span>
      </h3>

      {/* Introducción principal */}
      <RichTextArea
        label="Introducción de la Clase"
        sublabel="Texto de presentation inicial"
        rows={6}
        value={formData.introductionText}
        onChange={(val) =>
          setFormData((prev: any) => ({
            ...prev,
            introductionText: val,
          }))
        }
        placeholder="Escribí o pegá el texto de introducción..."
      />

      {/* Sección de Capítulos / Subsecciones del Desarrollo Pedagógico */}
      <div className="p-5 bg-black/40 rounded-2xl border border-white/10 space-y-4 shadow-inner">
        <div className="flex justify-between items-center pb-2 border-b border-white/10">
          <div>
            <h4 className="text-xs font-bold text-[#C9A45C] uppercase tracking-wider flex items-center space-x-2">
              <Layers className="w-4 h-4" />
              <span>Capítulos y Subsecciones Teóricas ({chapters.length})</span>
            </h4>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Subtemas del desarrollo pedagógico extraídos automáticamente o añadidos manualmente.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddChapter}
            className="bg-[#C9A45C]/20 border border-[#C9A45C] text-[#C9A45C] hover:bg-[#C9A45C] hover:text-black font-bold px-3 py-1.5 rounded-xl text-xs flex items-center space-x-1.5 transition-all shadow-md"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Agregar Capítulo</span>
          </button>
        </div>

        {chapters.length === 0 ? (
          <div className="text-center py-6 text-xs text-gray-500 italic bg-[#0C0A07] rounded-xl border border-white/5">
            No se han detectado subsecciones aún. Podés agregar capítulos manualmente o importar un PDF/MD.
          </div>
        ) : (
          <div className="space-y-4">
            {chapters.map((chap: any, idx: number) => (
              <div
                key={chap.id || idx}
                className="p-4 bg-[#0C0A07] rounded-xl border border-white/10 space-y-3 shadow-md"
              >
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-bold text-[#C9A45C] bg-[#C9A45C]/10 px-2.5 py-0.5 rounded border border-[#C9A45C]/30">
                    Capítulo #{idx + 1}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleRemoveChapter(idx)}
                    className="text-red-400 hover:text-red-300 text-xs flex items-center space-x-1 px-2 py-0.5 rounded hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Eliminar</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className={formData.hasVideo ? "md:col-span-2" : "md:col-span-3"}>
                    <label className="block text-[11px] text-[#B0A894] mb-1 font-medium">
                      Título del Capítulo / Subsección
                    </label>
                    <input
                      type="text"
                      value={chap.title}
                      onChange={(e) => handleUpdateChapter(idx, "title", e.target.value)}
                      placeholder="Ej: Estructura Histológica del Folículo"
                      className="w-full bg-[#15100A] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-[#C9A45C] outline-none"
                    />
                  </div>

                  {formData.hasVideo && (
                    <div>
                      <label className="block text-[11px] text-[#B0A894] mb-1 font-medium">
                        Marca de Tiempo (Video)
                      </label>
                      <input
                        type="text"
                        value={chap.timestamp || "00:00"}
                        onChange={(e) => handleUpdateChapter(idx, "timestamp", e.target.value)}
                        placeholder="05:30"
                        className="w-full bg-[#15100A] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-[#C9A45C] outline-none text-center font-mono"
                      />
                    </div>
                  )}
                </div>

                <RichTextArea
                  label="Contenido del Capítulo"
                  rows={4}
                  value={chap.content || ""}
                  onChange={(val) => handleUpdateChapter(idx, "content", val)}
                  placeholder="Explicación detallada de esta subsección..."
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resumen Ejecutivo */}
      <RichTextArea
        label="Resumen Ejecutivo"
        sublabel="Síntesis central del módulo"
        rows={5}
        value={formData.summaryText}
        onChange={(val) =>
          setFormData((prev: any) => ({
            ...prev,
            summaryText: val,
          }))
        }
        placeholder="Puntos sintetizados..."
      />

      {/* Grid Objetivos & Competencias */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RichTextArea
          label="Objetivos de Aprendizaje (1 por línea)"
          icon={<List className="w-3.5 h-3.5 text-[#C9A45C]" />}
          rows={6}
          value={formData.objectivesText}
          onChange={(val) =>
            setFormData((prev: any) => ({
              ...prev,
              objectivesText: val,
            }))
          }
          placeholder="• Definir qué es..."
        />

        <RichTextArea
          label="Competencias a Desarrollar (1 por línea)"
          icon={<List className="w-3.5 h-3.5 text-[#C9A45C]" />}
          rows={6}
          value={formData.competenciesText}
          onChange={(val) =>
            setFormData((prev: any) => ({
              ...prev,
              competenciesText: val,
            }))
          }
          placeholder="• Desarrollar la capacidad de..."
        />
      </div>

      {/* Grid Conceptos Clave & Glosario */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RichTextArea
          label="Conceptos Clave (1 por línea)"
          icon={<Key className="w-3.5 h-3.5 text-[#C9A45C]" />}
          rows={6}
          value={formData.keyConceptsText}
          onChange={(val) =>
            setFormData((prev: any) => ({
              ...prev,
              keyConceptsText: val,
            }))
          }
          placeholder="Método Cabello de Luna&#10;Preservación Capilar"
        />

        <RichTextArea
          label="Glosario Técnico (Término: Definición)"
          icon={<FileText className="w-3.5 h-3.5 text-[#C9A45C]" />}
          rows={6}
          value={formData.glossaryText}
          onChange={(val) =>
            setFormData((prev: any) => ({
              ...prev,
              glossaryText: val,
            }))
          }
          placeholder="Tricología: Disciplina que estudia el cabello..."
        />
      </div>
    </div>
  );
}
