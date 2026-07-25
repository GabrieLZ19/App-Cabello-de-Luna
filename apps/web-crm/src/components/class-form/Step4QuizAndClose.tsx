import React from "react";
import {
  Plus as PlusIcon,
  Trash2 as Trash2Icon,
  HelpCircle as HelpCircleIcon,
  BookOpen as BookOpenIcon,
} from "lucide-react";
import { RichTextArea } from "./RichTextArea";

interface Step4Props {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  onAddQuestion: () => void;
  onRemoveQuestion: (index: number) => void;
}

const Plus: any = PlusIcon;
const Trash2: any = Trash2Icon;
const HelpCircle: any = HelpCircleIcon;
const BookOpen: any = BookOpenIcon;

export function Step4QuizAndClose({
  formData,
  setFormData,
  onAddQuestion,
  onRemoveQuestion,
}: Step4Props) {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Quiz Builder Container */}
      <div className="bg-[#15100A] p-4 sm:p-6 rounded-2xl border border-white/10 space-y-4 sm:space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-white/10">
          <div>
            <h3 className="text-xs font-bold text-[#C9A45C] uppercase tracking-wider flex items-center space-x-2">
              <HelpCircle className="w-4 h-4" />
              <span>4. Autoevaluación Interactiva (Quiz)</span>
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Preguntas de opción múltiple para evaluación en la app.
            </p>
          </div>

          <button
            type="button"
            onClick={onAddQuestion}
            className="w-full sm:w-auto bg-[#C9A45C]/20 border border-[#C9A45C] text-[#C9A45C] hover:bg-[#C9A45C] hover:text-black font-bold px-3.5 py-2 rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-all shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Pregunta</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-xs text-[#B0A894] font-medium mb-1.5">
              Título de la Evaluación
            </label>
            <input
              type="text"
              value={formData.quizTitle}
              onChange={(e) =>
                setFormData((prev: any) => ({
                  ...prev,
                  quizTitle: e.target.value,
                }))
              }
              className="w-full bg-[#0C0A07] border border-white/10 rounded-xl p-3 text-xs text-white focus:border-[#C9A45C] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs text-[#B0A894] font-medium mb-1.5">
              Puntaje Mínimo para Aprobar (base 10)
            </label>
            <input
              type="number"
              value={formData.quizPassingScore}
              onChange={(e) =>
                setFormData((prev: any) => ({
                  ...prev,
                  quizPassingScore: Number(e.target.value),
                }))
              }
              className="w-full bg-[#0C0A07] border border-white/10 rounded-xl p-3 text-xs text-white focus:border-[#C9A45C] outline-none"
            />
          </div>
        </div>

        {/* Dynamic Questions List */}
        <div className="space-y-4 pt-2">
          {formData.quizQuestions.map((q: any, idx: number) => (
            <div
              key={idx}
              className="p-4 sm:p-5 bg-black/50 rounded-2xl border border-white/10 space-y-3 sm:space-y-4 shadow-inner"
            >
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-[#C9A45C] bg-[#C9A45C]/10 px-2.5 py-0.5 rounded-lg border border-[#C9A45C]/30">
                  Pregunta #{idx + 1}
                </span>

                {formData.quizQuestions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onRemoveQuestion(idx)}
                    className="text-red-400 hover:text-red-300 text-xs flex items-center space-x-1 px-2.5 py-1 rounded-lg hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Eliminar</span>
                  </button>
                )}
              </div>

              <input
                type="text"
                value={q.questionText}
                onChange={(e) => {
                  const updated = [...formData.quizQuestions];
                  updated[idx].questionText = e.target.value;
                  setFormData((prev: any) => ({
                    ...prev,
                    quizQuestions: updated,
                  }));
                }}
                placeholder="Enunciado de la pregunta..."
                className="w-full bg-[#15100A] border border-white/10 rounded-xl p-3 text-xs text-white font-semibold focus:border-[#C9A45C] outline-none"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {q.options.map((opt: string, optIdx: number) => (
                  <div
                    key={optIdx}
                    className={`flex items-center space-x-2.5 p-2 rounded-xl border transition-all ${
                      q.correctAnswerIndex === optIdx
                        ? "bg-[#C9A45C]/10 border-[#C9A45C]"
                        : "bg-[#0C0A07] border-white/5"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`correct-${idx}`}
                      checked={q.correctAnswerIndex === optIdx}
                      onChange={() => {
                        const updated = [...formData.quizQuestions];
                        updated[idx].correctAnswerIndex = optIdx;
                        setFormData((prev: any) => ({
                          ...prev,
                          quizQuestions: updated,
                        }));
                      }}
                      className="accent-[#C9A45C] w-4 h-4 cursor-pointer shrink-0"
                    />
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const updated = [...formData.quizQuestions];
                        updated[idx].options[optIdx] = e.target.value;
                        setFormData((prev: any) => ({
                          ...prev,
                          quizQuestions: updated,
                        }));
                      }}
                      className="w-full bg-transparent border-none text-xs text-white focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Conclusion and Bibliography */}
      <div className="bg-[#15100A] p-4 sm:p-6 rounded-2xl border border-white/10 space-y-4 sm:space-y-6 shadow-xl">
        <h3 className="text-xs font-bold text-[#C9A45C] uppercase tracking-wider flex items-center space-x-2">
          <BookOpen className="w-4 h-4" />
          <span>Conclusión & Bibliografía</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <RichTextArea
            label="Conclusión de la Lección"
            rows={5}
            value={formData.conclusionText}
            onChange={(val) =>
              setFormData((prev: any) => ({
                ...prev,
                conclusionText: val,
              }))
            }
            placeholder="Cierre pedagógico de la lección..."
          />

          <RichTextArea
            label="Bibliografía & Referencias"
            rows={5}
            value={formData.bibliographyText}
            onChange={(val) =>
              setFormData((prev: any) => ({
                ...prev,
                bibliographyText: val,
              }))
            }
            placeholder="• Autor, Libro, Edición..."
          />
        </div>
      </div>
    </div>
  );
}
