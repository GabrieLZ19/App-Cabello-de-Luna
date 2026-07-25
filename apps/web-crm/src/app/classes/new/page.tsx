"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import LinkRaw from "next/link";
import {
  ArrowLeft as ArrowLeftIcon,
  ArrowRight as ArrowRightIcon,
  Save as SaveIcon,
  Bookmark as BookmarkIcon,
} from "lucide-react";

import { parseClassFile, saveTheoreticalClass } from "@/services/classService";
import { Step1GeneralInfo } from "@/components/class-form/Step1GeneralInfo";
import { Step2ContentSummary } from "@/components/class-form/Step2ContentSummary";
import { Step3PracticalCases } from "@/components/class-form/Step3PracticalCases";
import { Step4QuizAndClose } from "@/components/class-form/Step4QuizAndClose";

const Link: any = LinkRaw;
const ArrowLeft: any = ArrowLeftIcon;
const ArrowRight: any = ArrowRightIcon;
const Save: any = SaveIcon;
const Bookmark: any = BookmarkIcon;

const splitHtmlLines = (html: string): string[] => {
  if (!html) return [];
  return html
    .replace(/<\/div>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => {
      if (!l) return false;
      const textOnly = l
        .replace(/<[^>]+>/g, "")
        .replace(/&nbsp;/gi, "")
        .trim();
      return (
        textOnly !== "" &&
        textOnly !== "•" &&
        textOnly !== "-" &&
        textOnly !== "*"
      );
    });
};

export default function NewClassPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [parseSuccess, setParseSuccess] = useState("");

  const DEFAULT_FORM_DATA = {
    moduleName: "",
    title: "",
    month: 1,
    week: 1,
    totalDurationMinutes: 45,
    level: "Técnico Profesional",
    instructorName: "",
    hasVideo: false,

    chapters: [] as {
      id: number;
      title: string;
      timestamp: string;
      status: string;
      content: string;
    }[],
    introductionText: "",
    summaryText: "",
    objectivesText: "",
    competenciesText: "",
    keyConceptsText: "",
    glossaryText: "",

    practicalCaseTitle: "",
    practicalCaseDesc: "",
    practicalCaseQuestions: "",
    practicalActivityTitle: "",
    practicalActivityInst: "",

    quizTitle: "Autoevaluación de Diagnóstico Capilar",
    quizPassingScore: 7,
    quizQuestions: [
      {
        questionText:
          "¿Cuál es la función principal del bulbo piloso en la tricología?",
        options: [
          "Nutrición del folículo",
          "Oxigenación epidérmica",
          "Pigmentación Melánica",
          "Queratinización dura",
        ],
        correctAnswerIndex: 0,
      },
    ],
    conclusionText: "",
    bibliographyText: "",

    sectionToggles: {
      intro: true,
      summary: true,
      objectives: true,
      competencies: true,
      keyConcepts: true,
      glossary: true,
      practicalCase: true,
      practicalActivity: true,
      conclusion: true,
      bibliography: true,
    } as Record<string, boolean>,
  };

  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
  const [isLoaded, setIsLoaded] = useState(false);
  const [draftSavedMsg] = useState("");

  React.useEffect(() => {
    try {
      const savedLocal = localStorage.getItem("new_class_saved_draft");
      const savedSession = sessionStorage.getItem("new_class_active_draft");
      const saved = savedLocal || savedSession;

      if (saved) {
        const parsed = JSON.parse(saved);
        setFormData((prev) => ({ ...prev, ...parsed }));
      }
    } catch (e) {
      console.error("Error al cargar borrador:", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  React.useEffect(() => {
    if (isLoaded) {
      try {
        sessionStorage.setItem(
          "new_class_active_draft",
          JSON.stringify(formData),
        );
      } catch (e) {
        console.error("Error al guardar borrador de sesión:", e);
      }
    }
  }, [formData, isLoaded]);

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      const payload = {
        moduleName: formData.moduleName || "Módulo Borrador",
        title: formData.title || "Clase sin título (Borrador)",
        month: Number(formData.month) || 1,
        week: Number(formData.week) || 1,
        totalDurationMinutes: Number(formData.totalDurationMinutes) || 45,
        level: formData.level,
        instructorName: formData.instructorName,
        hasVideo: formData.hasVideo,
        status: "DRAFT",
        chaptersJson: formData.chapters,
        introductionText: formData.introductionText,
        summaryText: formData.summaryText,
        objectivesJson: formData.objectivesText
          ? splitHtmlLines(formData.objectivesText)
          : [],
        competenciesJson: formData.competenciesText
          ? splitHtmlLines(formData.competenciesText)
          : [],
        keyConceptsJson: formData.keyConceptsText
          ? splitHtmlLines(formData.keyConceptsText)
          : [],
        glossaryJson: formData.glossaryText
          ? splitHtmlLines(formData.glossaryText)
              .filter((l) => l.includes(":"))
              .map((l) => {
                const parts = l.split(":");
                return {
                  term: parts[0].trim(),
                  definition: parts.slice(1).join(":").trim(),
                };
              })
          : [],
        practicalCaseJson: formData.practicalCaseDesc
          ? {
              title: formData.practicalCaseTitle || "Caso Práctico",
              description: formData.practicalCaseDesc,
              questions: formData.practicalCaseQuestions
                ? splitHtmlLines(formData.practicalCaseQuestions)
                : [],
            }
          : null,
        practicalActivityJson: formData.practicalActivityInst
          ? {
              title: formData.practicalActivityTitle || "Actividad Práctica",
              instructions: formData.practicalActivityInst,
            }
          : null,
        conclusionText: formData.conclusionText,
        bibliographyJson: formData.bibliographyText
          ? splitHtmlLines(formData.bibliographyText)
          : [],
        sectionTogglesJson: formData.sectionToggles,
        quizQuestions: formData.quizQuestions,
      };

      await saveTheoreticalClass(payload);
      clearSessionDraft();
      router.push("/classes");
    } catch (e) {
      console.error("Error guardando borrador en la base de datos:", e);
    } finally {
      setSaving(false);
    }
  };

  const clearSessionDraft = () => {
    try {
      sessionStorage.removeItem("new_class_active_draft");
      localStorage.removeItem("new_class_saved_draft");
    } catch (e) {}
  };

  const handleFileUpload = async (file: File) => {
    setSelectedFile(file);
    setParsing(true);
    setParseSuccess("");

    try {
      const parsed = await parseClassFile(file);

      setFormData((prev) => ({
        ...prev,
        moduleName: parsed.moduleName || prev.moduleName,
        title: parsed.title || prev.title,
        month: parsed.month || prev.month,
        week: parsed.week || prev.week,
        totalDurationMinutes:
          parsed.totalDurationMinutes || prev.totalDurationMinutes,
        level: parsed.level || prev.level,
        instructorName: parsed.instructorName || prev.instructorName,
        chapters: Array.isArray(parsed.chaptersJson)
          ? parsed.chaptersJson
          : prev.chapters,

        introductionText: parsed.introductionText || "",
        summaryText: parsed.summaryText || "",
        objectivesText: Array.isArray(parsed.objectivesJson)
          ? parsed.objectivesJson.join("\n")
          : "",
        competenciesText: Array.isArray(parsed.competenciesJson)
          ? parsed.competenciesJson.join("\n")
          : "",
        keyConceptsText: Array.isArray(parsed.keyConceptsJson)
          ? parsed.keyConceptsJson.join("\n")
          : "",
        glossaryText: Array.isArray(parsed.glossaryJson)
          ? parsed.glossaryJson
              .map((g: any) => `${g.term}: ${g.definition}`)
              .join("\n")
          : "",

        practicalCaseTitle: parsed.practicalCaseJson?.title || "",
        practicalCaseDesc: parsed.practicalCaseJson?.description || "",
        practicalCaseQuestions: Array.isArray(
          parsed.practicalCaseJson?.questions,
        )
          ? parsed.practicalCaseJson.questions.join("\n")
          : "",

        practicalActivityTitle: parsed.practicalActivityJson?.title || "",
        practicalActivityInst: parsed.practicalActivityJson?.instructions || "",

        quizQuestions:
          Array.isArray(parsed.quizQuestionsJson) &&
          parsed.quizQuestionsJson.length > 0
            ? parsed.quizQuestionsJson
            : prev.quizQuestions,
        conclusionText: parsed.conclusionText || "",
        bibliographyText: Array.isArray(parsed.bibliographyJson)
          ? parsed.bibliographyJson.join("\n")
          : "",
        sectionToggles: parsed.sectionTogglesJson || prev.sectionToggles,
      }));

      setParseSuccess(`Documento "${file.name}" procesado con éxito.`);
    } catch (err) {
      console.error("Error al procesar archivo:", err);
    } finally {
      setParsing(false);
    }
  };

  const handleAddQuizQuestion = () => {
    setFormData((prev) => ({
      ...prev,
      quizQuestions: [
        ...prev.quizQuestions,
        {
          questionText: "Nueva pregunta de evaluación...",
          options: ["Opción A", "Opción B", "Opción C", "Opción D"],
          correctAnswerIndex: 0,
        },
      ],
    }));
  };

  const handleRemoveQuizQuestion = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      quizQuestions: prev.quizQuestions.filter((_, i) => i !== index),
    }));
  };

  const handleSaveClass = async () => {
    setSaving(true);
    try {
      const payload = {
        moduleName: formData.moduleName,
        title: formData.title,
        month: Number(formData.month),
        week: Number(formData.week),
        totalDurationMinutes: Number(formData.totalDurationMinutes),
        level: formData.level,
        instructorName: formData.instructorName,
        hasVideo: formData.hasVideo,
        chaptersJson: formData.chapters,
        introductionText: formData.introductionText,
        summaryText: formData.summaryText,
        objectivesJson: formData.objectivesText
          ? splitHtmlLines(formData.objectivesText)
          : [],
        competenciesJson: formData.competenciesText
          ? splitHtmlLines(formData.competenciesText)
          : [],
        keyConceptsJson: formData.keyConceptsText
          ? splitHtmlLines(formData.keyConceptsText)
          : [],
        glossaryJson: formData.glossaryText
          ? splitHtmlLines(formData.glossaryText)
              .filter((l) => l.includes(":"))
              .map((l) => {
                const parts = l.split(":");
                return {
                  term: parts[0].trim(),
                  definition: parts.slice(1).join(":").trim(),
                };
              })
          : [],
        practicalCaseJson: formData.practicalCaseDesc
          ? {
              title: formData.practicalCaseTitle || "Caso Práctico",
              description: formData.practicalCaseDesc,
              questions: formData.practicalCaseQuestions
                ? splitHtmlLines(formData.practicalCaseQuestions)
                : [],
            }
          : null,
        practicalActivityJson: formData.practicalActivityInst
          ? {
              title: formData.practicalActivityTitle || "Actividad Práctica",
              instructions: formData.practicalActivityInst,
            }
          : null,
        conclusionText: formData.conclusionText,
        bibliographyJson: formData.bibliographyText
          ? splitHtmlLines(formData.bibliographyText)
          : [],
        sectionTogglesJson: formData.sectionToggles,
        quizQuestions: formData.quizQuestions,
      };

      await saveTheoreticalClass(payload);
      clearSessionDraft();
      router.push("/classes");
    } catch (err) {
      console.error("Error guardando clase:", err);
    } finally {
      setSaving(false);
    }
  };

  const progressPercent = currentStep * 25;

  return (
    <div className="p-4 sm:p-6 md:p-8 w-full min-h-screen space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-[#15100A] p-4 sm:p-6 rounded-2xl border border-white/10 shadow-xl gap-4">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <Link
            href="/classes"
            onClick={clearSessionDraft}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-black/40 border border-white/10 hover:border-[#C9A45C] flex items-center justify-center text-white transition-all shadow-inner shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg sm:text-2xl font-bold text-white tracking-tight">
              Crear Nueva Clase
            </h1>
            <p className="text-xs text-[#B0A894] mt-0.5">
              Configurá la lección de forma estructurada.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleSaveDraft}
            className="flex-1 sm:flex-none bg-[#1A140E] hover:bg-white/10 text-[#C9A45C] border border-[#C9A45C]/40 font-bold px-3 py-2.5 sm:px-5 sm:py-3 rounded-xl text-xs flex items-center justify-center space-x-2 transition-all shadow-md"
          >
            <Bookmark className="w-4 h-4" />
            <span>Borrador</span>
          </button>

          <button
            onClick={handleSaveClass}
            disabled={saving}
            className="flex-1 sm:flex-none bg-[#C9A45C] hover:bg-[#b5924d] text-black font-bold px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl text-xs flex items-center justify-center space-x-2 transition-all shadow-lg"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Guardando..." : "Publicar"}</span>
          </button>
        </div>
      </div>

      {draftSavedMsg && (
        <div className="flex items-center space-x-2 text-xs text-[#C9A45C] bg-[#C9A45C]/10 p-4 rounded-xl border border-[#C9A45C]/30 shadow-lg">
          <Bookmark className="w-4 h-4 shrink-0" />
          <span className="font-bold">{draftSavedMsg}</span>
        </div>
      )}

      {/* Stepper Indicator */}
      <div className="bg-[#15100A] p-4 sm:p-6 rounded-2xl border border-white/10 space-y-4 shadow-xl">
        <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider">
          <span className="text-[#C9A45C]">Progreso</span>
          <span className="text-white bg-[#C9A45C]/20 border border-[#C9A45C] px-2.5 py-0.5 rounded-full text-[11px]">
            {progressPercent}% Completado
          </span>
        </div>

        <div className="w-full bg-black/50 rounded-full h-2.5 overflow-hidden border border-white/10">
          <div
            className="bg-[#C9A45C] h-2.5 rounded-full transition-all duration-500 ease-out shadow-lg"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Pasos en Grilla Responsiva 2x2 en celular */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 pt-2">
          {[
            { step: 1, title: "1. Info & Archivo" },
            { step: 2, title: "2. Contenido" },
            { step: 3, title: "3. Casos Prácticos" },
            { step: 4, title: "4. Evaluación" },
          ].map((s) => (
            <button
              key={s.step}
              type="button"
              onClick={() => setCurrentStep(s.step)}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border text-center truncate ${
                currentStep === s.step
                  ? "bg-[#C9A45C] text-black border-[#C9A45C] shadow-lg"
                  : currentStep > s.step
                    ? "bg-[#C9A45C]/15 text-[#C9A45C] border-[#C9A45C]/40"
                    : "bg-black/30 text-gray-400 border-white/10"
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>
      </div>

      {/* Renderizado de Componentes por Paso */}
      {currentStep === 1 && (
        <Step1GeneralInfo
          formData={formData}
          setFormData={setFormData}
          onFileUpload={handleFileUpload}
          parsing={parsing}
          parseSuccess={parseSuccess}
        />
      )}

      {currentStep === 2 && (
        <Step2ContentSummary formData={formData} setFormData={setFormData} />
      )}

      {currentStep === 3 && (
        <Step3PracticalCases formData={formData} setFormData={setFormData} />
      )}

      {currentStep === 4 && (
        <Step4QuizAndClose
          formData={formData}
          setFormData={setFormData}
          onAddQuestion={handleAddQuizQuestion}
          onRemoveQuestion={handleRemoveQuizQuestion}
        />
      )}

      {/* Stepper Navigation Footer Buttons */}
      <div className="flex justify-between items-center bg-[#15100A] p-4 sm:p-5 rounded-2xl border border-white/10 shadow-xl">
        <button
          type="button"
          disabled={currentStep === 1}
          onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
          className={`px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl text-xs font-bold flex items-center space-x-2 ${
            currentStep === 1
              ? "opacity-30 cursor-not-allowed text-gray-500"
              : "bg-black/40 border border-white/10 text-white hover:border-[#C9A45C]"
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Anterior</span>
        </button>

        {currentStep < 4 ? (
          <button
            type="button"
            onClick={() => setCurrentStep((prev) => Math.min(4, prev + 1))}
            className="bg-[#C9A45C] hover:bg-[#b5924d] text-black font-bold px-5 py-2.5 sm:px-7 sm:py-3 rounded-xl text-xs flex items-center space-x-2 shadow-lg"
          >
            <span>Siguiente</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSaveClass}
            disabled={saving}
            className="bg-[#C9A45C] hover:bg-[#b5924d] text-black font-bold px-5 py-2.5 sm:px-7 sm:py-3 rounded-xl text-xs flex items-center space-x-2 shadow-lg"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Guardando..." : "Finalizar y Publicar"}</span>
          </button>
        )}
      </div>
    </div>
  );
}
