"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import LinkRaw from "next/link";
import { ArrowLeft as ArrowLeftIcon, ArrowRight as ArrowRightIcon, Save as SaveIcon } from "lucide-react";

const ArrowLeft: any = ArrowLeftIcon;
const ArrowRight: any = ArrowRightIcon;
const Save: any = SaveIcon;
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

    chapters: [] as { id: number; title: string; timestamp: string; status: string; content: string }[],
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

  // Carga inicial de datos de la clase desde la API
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
              questionText: q.questionText,
              options: q.optionsJson || [
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

  // Re-escaneo de archivo en edición
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
        chapters: Array.isArray(parsed.chaptersJson) ? parsed.chaptersJson : prev.chapters,

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
        `Se re-escanean las secciones del archivo "${file.name}" con éxito.`,
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
          ? formData.objectivesText.split("\n").filter((l) => l.trim())
          : [],
        competenciesJson: formData.competenciesText
          ? formData.competenciesText.split("\n").filter((l) => l.trim())
          : [],
        keyConceptsJson: formData.keyConceptsText
          ? formData.keyConceptsText.split("\n").filter((l) => l.trim())
          : [],
        glossaryJson: formData.glossaryText
          ? formData.glossaryText
              .split("\n")
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
                ? formData.practicalCaseQuestions
                    .split("\n")
                    .filter((l) => l.trim())
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
          ? formData.bibliographyText.split("\n").filter((l) => l.trim())
          : [],
        chaptersJson: formData.chapters || [],
        sectionTogglesJson: formData.sectionToggles,
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
      <div className="p-8 w-full space-y-4">
        <div className="h-16 bg-white/10 rounded-2xl animate-pulse" />
        <div className="h-32 bg-[#C9A45C]/15 rounded-2xl animate-pulse" />
        <div className="h-64 bg-white/5 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-8 w-full min-h-screen space-y-6">
      {/* Navigation Top Bar */}
      <div className="flex items-center justify-between bg-[#15100A] p-6 rounded-2xl border border-white/10 shadow-xl">
        <div className="flex items-center space-x-4">
          <Link
            href="/classes"
            className="w-11 h-11 rounded-xl bg-black/40 border border-white/10 hover:border-[#C9A45C] flex items-center justify-center text-white transition-all shadow-inner"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Editar Clase Teórica
            </h1>
            <p className="text-xs text-[#B0A894] mt-0.5">
              Modificá las secciones pedagógicas o re-escaneá el contenido desde
              un archivo PDF/MD.
            </p>
          </div>
        </div>

        <button
          onClick={handleUpdateClass}
          disabled={saving}
          className="bg-[#C9A45C] hover:bg-[#b5924d] text-black font-bold px-6 py-3 rounded-xl text-xs flex items-center space-x-2 transition-all shadow-lg"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? "Guardando..." : "Guardar Cambios"}</span>
        </button>
      </div>

      {/* Progress Bar & Stepper Indicator */}
      <div className="bg-[#15100A] p-6 rounded-2xl border border-white/10 space-y-4 shadow-xl">
        <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider">
          <span className="text-[#C9A45C]">
            Progreso de Edición de la Lección
          </span>
          <span className="text-white bg-[#C9A45C]/20 border border-[#C9A45C] px-3 py-1 rounded-full">
            {progressPercent}% Completado
          </span>
        </div>

        <div className="w-full bg-black/50 rounded-full h-2.5 overflow-hidden border border-white/10">
          <div
            className="bg-[#C9A45C] h-2.5 rounded-full transition-all duration-500 ease-out shadow-lg"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="grid grid-cols-4 gap-3 pt-2">
          {[
            { step: 1, title: "1. Info & Archivo" },
            { step: 2, title: "2. Contenido & Resumen" },
            { step: 3, title: "3. Casos & Actividades" },
            { step: 4, title: "4. Autoevaluación & Cierre" },
          ].map((s) => (
            <button
              key={s.step}
              type="button"
              onClick={() => setCurrentStep(s.step)}
              className={`py-3 px-4 rounded-xl text-xs font-bold transition-all border text-center ${
                currentStep === s.step
                  ? "bg-[#C9A45C] text-black border-[#C9A45C] shadow-lg scale-[1.02]"
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

      {/* Stepper Footer Buttons */}
      <div className="flex justify-between items-center bg-[#15100A] p-5 rounded-2xl border border-white/10 shadow-xl">
        <button
          type="button"
          disabled={currentStep === 1}
          onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
          className={`px-6 py-3 rounded-xl text-xs font-bold flex items-center space-x-2 ${
            currentStep === 1
              ? "opacity-30 cursor-not-allowed text-gray-500"
              : "bg-black/40 border border-white/10 text-white hover:border-[#C9A45C]"
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Paso Anterior</span>
        </button>

        {currentStep < 4 ? (
          <button
            type="button"
            onClick={() => setCurrentStep((prev) => Math.min(4, prev + 1))}
            className="bg-[#C9A45C] hover:bg-[#b5924d] text-black font-bold px-7 py-3 rounded-xl text-xs flex items-center space-x-2 shadow-lg"
          >
            <span>Siguiente Paso</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleUpdateClass}
            disabled={saving}
            className="bg-[#C9A45C] hover:bg-[#b5924d] text-black font-bold px-7 py-3 rounded-xl text-xs flex items-center space-x-2 shadow-lg"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Guardando..." : "Guardar Cambios"}</span>
          </button>
        )}
      </div>
    </div>
  );
}
