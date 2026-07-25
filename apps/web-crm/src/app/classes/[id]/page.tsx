"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import LinkRaw from "next/link";
import {
  ArrowLeft as ArrowLeftIcon,
  ArrowRight as ArrowRightIcon,
  Save as SaveIcon,
} from "lucide-react";

import {
  getTheoreticalModuleById,
  parseClassFile,
  updateTheoreticalClass,
} from "@/services/classService";
import { Step1GeneralInfo } from "@/components/class-form/Step1GeneralInfo";
import { Step2ContentSummary } from "@/components/class-form/Step2ContentSummary";
import { Step3PracticalCases } from "@/components/class-form/Step3PracticalCases";
import { Step4QuizAndClose } from "@/components/class-form/Step4QuizAndClose";

const Link: any = LinkRaw;
const ArrowLeft: any = ArrowLeftIcon;
const ArrowRight: any = ArrowRightIcon;
const Save: any = SaveIcon;

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

export default function EditClassPage() {
  const router = useRouter();
  const params = useParams();
  const classId = params?.id as string;

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [parseSuccess, setParseSuccess] = useState("");

  const [formData, setFormData] = useState({
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
  });

  useEffect(() => {
    async function loadClassData() {
      try {
        const mod = await getTheoreticalModuleById(classId);
        if (mod) {
          setFormData({
            moduleName: mod.moduleName || "",
            title: mod.title || "",
            month: mod.month || 1,
            week: mod.week || 1,
            totalDurationMinutes: mod.totalDurationMinutes || 45,
            level: mod.level || "Técnico Profesional",
            instructorName: mod.instructorName || mod.avatar?.name || "",
            hasVideo: mod.hasVideo !== undefined ? mod.hasVideo : false,
            introductionText: mod.introductionText || "",
            summaryText: mod.summaryText || "",
            objectivesText: (mod.objectivesJson || []).join("\n"),
            competenciesText: (mod.competenciesJson || []).join("\n"),
            keyConceptsText: (mod.keyConceptsJson || []).join("\n"),
            glossaryText: (mod.glossaryJson || [])
              .map((g: any) => `${g.term}: ${g.definition}`)
              .join("\n"),
            practicalCaseTitle: mod.practicalCaseJson?.title || "",
            practicalCaseDesc: mod.practicalCaseJson?.description || "",
            practicalCaseQuestions: (
              mod.practicalCaseJson?.questions || []
            ).join("\n"),
            practicalActivityTitle: mod.practicalActivityJson?.title || "",
            practicalActivityInst:
              mod.practicalActivityJson?.instructions || "",
            quizTitle:
              mod.evaluations?.[0]?.title ||
              "Autoevaluación de Diagnóstico Capilar",
            quizPassingScore: mod.evaluations?.[0]?.passingScore || 7,
            quizQuestions: mod.evaluations?.[0]?.questions?.map((q: any) => ({
              questionText: q.text || q.questionText || "",
              options: q.options ||
                q.optionsJson || [
                  "Opción A",
                  "Opción B",
                  "Opción C",
                  "Opción D",
                ],
              correctAnswerIndex: q.correctAnswerIndex || 0,
            })) || [
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
            conclusionText: mod.conclusionText || "",
            bibliographyText: (mod.bibliographyJson || []).join("\n"),
            chapters: Array.isArray(mod.chaptersJson) ? mod.chaptersJson : [],
            sectionToggles: mod.sectionTogglesJson || {
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
            },
          });
        }
      } catch (err) {
        console.error("Error al cargar la clase:", err);
      } finally {
        setLoading(false);
      }
    }
    if (classId) loadClassData();
  }, [classId]);

  const handleFileUpload = async (file: File) => {
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

      setParseSuccess(
        `Se re-escanean las secciones de "${file.name}" con éxito.`,
      );
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

  const handleUpdateClass = async () => {
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
        chaptersJson: formData.chapters || [],
        sectionTogglesJson: formData.sectionToggles,
        quizQuestions: formData.quizQuestions,
      };

      await updateTheoreticalClass(classId, payload);
      router.push("/classes");
    } catch (err) {
      console.error("Error actualizando clase:", err);
    } finally {
      setSaving(false);
    }
  };

  const progressPercent = currentStep * 25;

  if (loading) {
    return (
      <div className="p-4 sm:p-8 w-full space-y-4">
        <div className="h-16 bg-white/10 rounded-2xl animate-pulse" />
        <div className="h-32 bg-[#C9A45C]/15 rounded-2xl animate-pulse" />
        <div className="h-64 bg-white/5 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 w-full min-h-screen space-y-6">
      {/* Navigation Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-[#15100A] p-4 sm:p-6 rounded-2xl border border-white/10 shadow-xl gap-4">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <Link
            href="/classes"
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-black/40 border border-white/10 hover:border-[#C9A45C] flex items-center justify-center text-white transition-all shadow-inner shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg sm:text-2xl font-bold text-white tracking-tight">
              Editar Clase Teórica
            </h1>
            <p className="text-xs text-[#B0A894] mt-0.5">
              Modificá las secciones o re-escaneá el PDF/MD.
            </p>
          </div>
        </div>

        <button
          onClick={handleUpdateClass}
          disabled={saving}
          className="w-full sm:w-auto bg-[#C9A45C] hover:bg-[#b5924d] text-black font-bold px-6 py-3 rounded-xl text-xs flex items-center justify-center space-x-2 transition-all shadow-lg"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? "Guardando..." : "Guardar Cambios"}</span>
        </button>
      </div>

      {/* Stepper Progress */}
      <div className="bg-[#15100A] p-4 sm:p-6 rounded-2xl border border-white/10 space-y-4 shadow-xl">
        <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider">
          <span className="text-[#C9A45C]">Progreso de Edición</span>
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

      {/* Stepper Footer Navigation */}
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
            onClick={handleUpdateClass}
            disabled={saving}
            className="bg-[#C9A45C] hover:bg-[#b5924d] text-black font-bold px-5 py-2.5 sm:px-7 sm:py-3 rounded-xl text-xs flex items-center space-x-2 shadow-lg"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Guardando..." : "Guardar Cambios"}</span>
          </button>
        )}
      </div>
    </div>
  );
}
