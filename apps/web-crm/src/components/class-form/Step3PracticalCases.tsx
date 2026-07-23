import React from "react";
import { HelpCircle as HelpCircleIcon, Sparkles as SparklesIcon } from "lucide-react";
import { RichTextArea } from "./RichTextArea";

const HelpCircle: any = HelpCircleIcon;
const Sparkles: any = SparklesIcon;

interface Step3Props {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

export function Step3PracticalCases({ formData, setFormData }: Step3Props) {
  return (
    <div className="bg-[#15100A] p-6 rounded-2xl border border-white/10 space-y-6 shadow-xl">
      <h3 className="text-xs font-bold text-[#C9A45C] uppercase tracking-wider flex items-center space-x-2">
        <Sparkles className="w-4 h-4" />
        <span>3. Casos Prácticos & Actividades Guiadas</span>
      </h3>

      {/* Caso Práctico */}
      <div className="p-6 bg-black/40 rounded-2xl border border-white/10 space-y-4 shadow-inner">
        <h4 className="text-xs font-bold text-[#C9A45C] uppercase tracking-wider">
          Caso Práctico de Estudio
        </h4>

        <div>
          <label className="block text-xs text-[#B0A894] mb-1 font-medium">
            Título del Caso
          </label>
          <input
            type="text"
            value={formData.practicalCaseTitle}
            onChange={(e) =>
              setFormData((prev: any) => ({
                ...prev,
                practicalCaseTitle: e.target.value,
              }))
            }
            placeholder="Ej: Caso Clínico de Tricotilosis Severa"
            className="w-full bg-[#0C0A07] border border-white/10 rounded-xl p-3.5 text-xs text-white focus:border-[#C9A45C] outline-none"
          />
        </div>

        <RichTextArea
          label="Descripción y Contexto del Caso"
          rows={5}
          value={formData.practicalCaseDesc}
          onChange={(val) =>
            setFormData((prev: any) => ({
              ...prev,
              practicalCaseDesc: val,
            }))
          }
          placeholder="Describir la situación del modelo o paciente..."
        />

        <RichTextArea
          label="Preguntas de Reflexión (1 por línea)"
          rows={4}
          value={formData.practicalCaseQuestions}
          onChange={(val) =>
            setFormData((prev: any) => ({
              ...prev,
              practicalCaseQuestions: val,
            }))
          }
          placeholder="1. ¿Qué tratamiento aplicarías?&#10;2. ¿Qué hábitos modificarías?"
        />
      </div>

      {/* Actividad Práctica */}
      <div className="p-6 bg-black/40 rounded-2xl border border-white/10 space-y-4 shadow-inner">
        <h4 className="text-xs font-bold text-[#C9A45C] uppercase tracking-wider">
          Actividad Práctica Guiada
        </h4>

        <div>
          <label className="block text-xs text-[#B0A894] mb-1 font-medium">
            Título de la Actividad
          </label>
          <input
            type="text"
            value={formData.practicalActivityTitle}
            onChange={(e) =>
              setFormData((prev: any) => ({
                ...prev,
                practicalActivityTitle: e.target.value,
              }))
            }
            placeholder="Ej: Ejercicio Práctico en Cabezal de Prueba"
            className="w-full bg-[#0C0A07] border border-white/10 rounded-xl p-3.5 text-xs text-white focus:border-[#C9A45C] outline-none"
          />
        </div>

        <RichTextArea
          label="Instrucciones Paso a Paso"
          rows={5}
          value={formData.practicalActivityInst}
          onChange={(val) =>
            setFormData((prev: any) => ({
              ...prev,
              practicalActivityInst: val,
            }))
          }
          placeholder="Indicar las acciones técnicas que el alumno debe ejecutar..."
        />
      </div>
    </div>
  );
}
