import { Injectable } from "@nestjs/common";

export interface QuizQuestionParsed {
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface ParsedModuleSections {
  moduleName: string;
  title: string;
  month: number;
  week: number;
  totalDurationMinutes: number;
  level: string;
  instructorName: string;
  objectivesJson: string[];
  competenciesJson: string[];
  introductionText: string;
  chaptersJson: {
    id: number;
    title: string;
    timestamp: string;
    status: string;
    content: string;
  }[];
  summaryText: string;
  keyConceptsJson: string[];
  glossaryJson: { term: string; definition: string }[];
  practicalCaseJson: {
    title: string;
    description: string;
    questions: string[];
  } | null;
  practicalActivityJson: { title: string; instructions: string } | null;
  quizQuestionsJson: QuizQuestionParsed[];
  conclusionText: string;
  bibliographyJson: string[];
  hasVideo: boolean;
  sectionTogglesJson: Record<string, boolean>;
}

@Injectable()
export class PdfParserService {
  parseClassText(rawText: string): ParsedModuleSections {
    // 1. FILTRO RIGUROSO DE PIES DE PÁGINA Y NÚMEROS ISLADOS
    const isFooterLine = (line: string): boolean => {
      const trimmed = line.trim();
      return (
        /^\d+$/.test(trimmed) || // Solo números (ej: "10")
        /^[-—\s]*\d+(\s*of\s*\d+)?[-—\s]*$/i.test(trimmed) || // Ej: "- 10 of 11 --"
        /^p[aá]gina\s+\d+/i.test(trimmed) // Ej: "Página 10"
      );
    };

    const lines = rawText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && !isFooterLine(l));

    let moduleName = "";
    let title = "";
    let month = 1;
    let week = 1;
    let totalDurationMinutes = 20;
    let level = "Técnico Profesional";
    let instructorName = "";

    const objectives: string[] = [];
    const competencies: string[] = [];
    let introductionText = "";

    // Capítulos/Subtemas del desarrollo
    const chapters: {
      id: number;
      title: string;
      timestamp: string;
      status: string;
      content: string;
    }[] = [];
    let currentChapterTitle = "";
    let currentChapterContent = "";

    let summaryText = "";
    const keyConcepts: string[] = [];
    const glossary: { term: string; definition: string }[] = [];
    let caseTitle = "Caso Práctico de Estudio";
    let caseDescription = "";
    const caseQuestions: string[] = [];
    let activityTitle = "Actividad Práctica Guiada";
    let activityInstructions = "";

    // Quiz
    const rawQuizQuestions: { questionText: string; options: string[] }[] = [];
    const answerList: string[] = [];

    let conclusionText = "";
    const bibliography: string[] = [];

    let currentSection = "";

    const normalize = (str: string) => {
      return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9\s]/g, "")
        .trim()
        .toUpperCase();
    };

    const cleanLine = (str: string) => {
      return str
        .replace(/^#+\s*/, "")
        .replace(/^\*\*|\*\*$/g, "")
        .replace(/^[-•*+☑✔]\s*/, "")
        .replace(/^(\d+[\.\)]\s*)+/, "")
        .trim();
    };

    const isSubHeading = (rawLine: string, normLine: string): boolean => {
      return (
        rawLine.startsWith("##") ||
        rawLine.startsWith("¿") ||
        (rawLine === rawLine.toUpperCase() &&
          rawLine.length > 5 &&
          rawLine.length < 90 &&
          !rawLine.endsWith(".") &&
          !rawLine.startsWith("•") &&
          !rawLine.startsWith("-"))
      );
    };

    for (let i = 0; i < lines.length; i++) {
      const rawLine = lines[i];
      const normLine = normalize(rawLine);
      const cleaned = cleanLine(rawLine);

      // --- METADATOS ---
      if (!moduleName && normLine.startsWith("MODULO")) {
        const match = rawLine.match(/\d+/);
        if (match) month = parseInt(match[0], 10);
        if (rawLine.includes(":") || rawLine.includes("-")) {
          moduleName = cleanLine(rawLine);
        } else if (
          i + 1 < lines.length &&
          !normalize(lines[i + 1]).startsWith("CLASE")
        ) {
          moduleName = `${cleanLine(rawLine)}: ${cleanLine(lines[i + 1])}`;
          i++;
        } else {
          moduleName = cleanLine(rawLine);
        }
        continue;
      }

      if (
        !title &&
        (normLine.startsWith("CLASE") || normLine.startsWith("LECCION"))
      ) {
        const match = rawLine.match(/\d+/);
        if (match) week = parseInt(match[0], 10);
        if (rawLine.includes(":") || rawLine.includes("-")) {
          title = cleanLine(rawLine);
        } else if (
          i + 1 < lines.length &&
          !normalize(lines[i + 1]).startsWith("DURACION")
        ) {
          title = `${cleanLine(rawLine)}: ${cleanLine(lines[i + 1])}`;
          i++;
        } else {
          title = cleanLine(rawLine);
        }
        continue;
      }

      if (
        normLine.includes("DURACION") ||
        normLine.includes("TIEMPO DE LECTURA")
      ) {
        const match = rawLine.match(/\d+/);
        if (match) totalDurationMinutes = parseInt(match[0], 10);
        continue;
      }

      if (normLine.startsWith("NIVEL")) {
        const parts = rawLine.split(/[:\-]/);
        if (parts.length > 1) level = cleanLine(parts.slice(1).join(":"));
        continue;
      }

      if (
        !instructorName &&
        (normLine.startsWith("PROFESOR") ||
          normLine.startsWith("DOCENTE") ||
          normLine.startsWith("INSTRUCTOR"))
      ) {
        if (rawLine.includes(":")) {
          instructorName = cleanLine(
            rawLine.substring(rawLine.indexOf(":") + 1),
          );
        } else {
          instructorName = cleaned;
        }
        continue;
      }

      // --- DETECCIÓN DE SECCIONES PRINCIPALES ---
      let detectedSection = "";

      if (normLine === "OBJETIVOS DE APRENDIZAJE" || normLine === "OBJETIVOS") {
        detectedSection = "OBJECTIVES";
      } else if (
        normLine === "COMPETENCIAS A DESARROLLAR" ||
        normLine === "COMPETENCIAS"
      ) {
        detectedSection = "COMPETENCIES";
      } else if (normLine === "INTRODUCCION" || normLine === "PRESENTACION") {
        detectedSection = "INTRO";
      } else if (normLine === "RESUMEN" || normLine === "SINTESIS") {
        detectedSection = "SUMMARY";
      } else if (
        normLine === "CONCEPTOS CLAVE" ||
        normLine === "CONCEPTOS PRINCIPALES"
      ) {
        detectedSection = "KEY_CONCEPTS";
      } else if (normLine === "GLOSARIO" || normLine === "DEFINICIONES") {
        detectedSection = "GLOSSARY";
      } else if (
        normLine.startsWith("CASO PRACTICO") ||
        normLine.startsWith("CASO DE ESTUDIO")
      ) {
        detectedSection = "PRACTICAL_CASE";
        caseTitle = cleaned;
      } else if (
        normLine.startsWith("ACTIVIDAD PRACTICA") ||
        normLine.startsWith("EJERCICIO PRACTICO")
      ) {
        detectedSection = "PRACTICAL_ACTIVITY";
        activityTitle = cleaned;
      } else if (normLine === "AUTOEVALUACION" || normLine === "EVALUACION") {
        detectedSection = "QUIZ";
      } else if (normLine === "RESPUESTAS") {
        detectedSection = "QUIZ_ANSWERS";
      } else if (normLine === "CONCLUSION" || normLine === "CIERRE") {
        detectedSection = "CONCLUSION";
      } else if (normLine === "BIBLIOGRAFIA" || normLine === "REFERENCIAS") {
        detectedSection = "BIBLIOGRAPHY";
      }

      if (detectedSection) {
        // Guardar capítulo pendiente si cambiamos de sección
        if (currentChapterTitle && currentChapterContent) {
          chapters.push({
            id: chapters.length + 1,
            title: currentChapterTitle,
            timestamp: "00:00",
            status: "completed",
            content: currentChapterContent.trim(),
          });
          currentChapterTitle = "";
          currentChapterContent = "";
        }
        currentSection = detectedSection;
        continue;
      }

      if (!cleaned) continue;

      // --- CORTE DE INTRODUCCIÓN Y CREACIÓN DE SUB-CAPÍTULOS ---
      if (
        (currentSection === "INTRO" || currentSection === "CHAPTER") &&
        isSubHeading(rawLine, normLine)
      ) {
        if (currentChapterTitle && currentChapterContent) {
          chapters.push({
            id: chapters.length + 1,
            title: currentChapterTitle,
            timestamp: "00:00",
            status: "completed",
            content: currentChapterContent.trim(),
          });
        }
        currentChapterTitle = cleaned;
        currentChapterContent = "";
        currentSection = "CHAPTER";
        continue;
      }

      // --- ACUMULACIÓN POR SECCIÓN ---
      if (currentSection === "OBJECTIVES") {
        objectives.push(cleaned);
      } else if (currentSection === "COMPETENCIES") {
        competencies.push(cleaned);
      } else if (currentSection === "INTRO") {
        introductionText +=
          (introductionText ? "\n\n" : "") + rawLine.replace(/^#+\s*/, "");
      } else if (currentSection === "CHAPTER") {
        currentChapterContent +=
          (currentChapterContent ? "\n\n" : "") + rawLine.replace(/^#+\s*/, "");
      } else if (currentSection === "SUMMARY") {
        summaryText += (summaryText ? "\n\n" : "") + cleaned;
      } else if (currentSection === "KEY_CONCEPTS") {
        keyConcepts.push(cleaned);
      } else if (currentSection === "GLOSSARY") {
        if (rawLine.includes(":") || rawLine.includes("-")) {
          const parts = rawLine.split(/[:\-]/);
          glossary.push({
            term: cleanLine(parts[0]),
            definition: parts.slice(1).join(":").trim(),
          });
        } else {
          glossary.push({ term: cleaned, definition: "Término conceptual" });
        }
      } else if (currentSection === "PRACTICAL_CASE") {
        // Detectar si es una pregunta reflexiva (empieza por número o por "¿")
        const isReflectionQuestion =
          /^[-\s]*\d+[\.\)]/i.test(rawLine) || rawLine.trim().startsWith("¿");
        if (isReflectionQuestion && !normLine.startsWith("ANALIZA")) {
          caseQuestions.push(cleaned);
        } else if (!normLine.startsWith("ANALIZA")) {
          caseDescription += (caseDescription ? "\n\n" : "") + cleaned;
        }
      } else if (currentSection === "PRACTICAL_ACTIVITY") {
        activityInstructions += (activityInstructions ? "\n\n" : "") + cleaned;
      } else if (currentSection === "QUIZ") {
        // Detectar opción (a), b), c), d))
        const isOption = /^[-•*+]?\s*[a-d][\.\)]/i.test(rawLine);

        if (isOption && rawQuizQuestions.length > 0) {
          const currentQ = rawQuizQuestions[rawQuizQuestions.length - 1];
          const optionText = rawLine
            .replace(/^[-•*+]?\s*[a-d][\.\)]\s*/i, "")
            .trim();
          currentQ.options.push(optionText);
        } else {
          // Si la pregunta anterior ya tiene 4 opciones O si es el primer enunciado, creamos una NUEVA pregunta
          const lastQuestion = rawQuizQuestions[rawQuizQuestions.length - 1];
          if (
            !lastQuestion ||
            lastQuestion.options.length >= 4 ||
            /^\d+[\.\)]/.test(rawLine) ||
            rawLine.startsWith("¿")
          ) {
            rawQuizQuestions.push({
              questionText: cleaned,
              options: [],
            });
          } else {
            // Si no tenía opciones todavía y no traía número, es continuación del texto de la pregunta anterior
            lastQuestion.questionText += " " + cleaned;
          }
        }
      } else if (currentSection === "QUIZ_ANSWERS") {
        const match = rawLine.match(/([a-d])/i);
        if (match) {
          answerList.push(match[1].toLowerCase());
        }
      } else if (currentSection === "CONCLUSION") {
        conclusionText += (conclusionText ? "\n\n" : "") + cleaned;
      } else if (currentSection === "BIBLIOGRAPHY") {
        bibliography.push(cleaned);
      }
    }

    // Push del último capítulo si quedó abierto
    if (currentChapterTitle && currentChapterContent) {
      chapters.push({
        id: chapters.length + 1,
        title: currentChapterTitle,
        timestamp: "00:00",
        status: "completed",
        content: currentChapterContent.trim(),
      });
    }

    // Mapeo final de preguntas y respuestas
    const optionLetterToIndex: Record<string, number> = {
      a: 0,
      b: 1,
      c: 2,
      d: 3,
    };
    const quizQuestionsJson: QuizQuestionParsed[] = rawQuizQuestions.map(
      (q, idx) => {
        const correctLetter = answerList[idx] || "a";
        return {
          questionText: q.questionText,
          options:
            q.options.length >= 4
              ? q.options
              : ["Opción A", "Opción B", "Opción C", "Opción D"],
          correctAnswerIndex: optionLetterToIndex[correctLetter] ?? 0,
        };
      },
    );

    // Helper para transformar marcas de formato markdown (*, **, listas) a HTML listo para el editor WYSIWYG
    const formatMarkdownToHtml = (text: string): string => {
      if (!text || !text.trim()) return "";

      const lines = text.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
      let htmlResult = "";
      let inList = false;
      let listType: "ul" | "ol" = "ul";

      const processInlineStyles = (str: string): string => {
        return str
          .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
          .replace(/\*(.*?)\*/g, "<i>$1</i>")
          .replace(/__(.*?)__/g, "<b>$1</b>")
          .replace(/_(.*?)_/g, "<i>$1</i>");
      };

      for (const line of lines) {
        const isUnordered = /^[-•*+]\s+/.test(line);
        const isOrdered = /^\d+[\.\)]\s+/.test(line);

        if (isUnordered || isOrdered) {
          const currentType = isOrdered ? "ol" : "ul";
          if (!inList) {
            inList = true;
            listType = currentType;
            htmlResult += `<${listType}>`;
          } else if (listType !== currentType) {
            htmlResult += `</${listType}><${currentType}>`;
            listType = currentType;
          }

          const cleanContent = line.replace(/^([-•*+]|\d+[\.\)])\s+/, "");
          htmlResult += `<li>${processInlineStyles(cleanContent)}</li>`;
        } else {
          if (inList) {
            htmlResult += `</${listType}>`;
            inList = false;
          }
          htmlResult += `<p>${processInlineStyles(line)}</p>`;
        }
      }

      if (inList) {
        htmlResult += `</${listType}>`;
      }

      return htmlResult;
    };

    // Formatear capítulos con HTML enriquecido
    const formattedChapters = chapters.map((chap) => ({
      ...chap,
      content: formatMarkdownToHtml(chap.content),
    }));

    return {
      moduleName:
        moduleName.trim() || "Módulo 1: Fundamentos del Método Cabello de Luna",
      title: title.trim() || "Clase 1: Introducción al Método Cabello de Luna",
      month,
      week,
      totalDurationMinutes,
      level: level.trim() || "Técnico Profesional",
      instructorName:
        instructorName.trim() || "Especialista en Tricología Cosmética",
      objectivesJson: objectives,
      competenciesJson: competencies,
      introductionText: formatMarkdownToHtml(introductionText),
      chaptersJson: formattedChapters,
      summaryText: formatMarkdownToHtml(summaryText),
      keyConceptsJson: keyConcepts,
      glossaryJson: glossary,
      practicalCaseJson: caseDescription.trim()
        ? {
            title: caseTitle || "Caso Práctico de Estudio",
            description: formatMarkdownToHtml(caseDescription),
            questions: caseQuestions,
          }
        : null,
      practicalActivityJson: activityInstructions.trim()
        ? {
            title: activityTitle || "Actividad Práctica Guiada",
            instructions: formatMarkdownToHtml(activityInstructions),
          }
        : null,
      quizQuestionsJson,
      conclusionText: formatMarkdownToHtml(conclusionText),
      bibliographyJson: bibliography,
      hasVideo: false,
      sectionTogglesJson: {
        intro: Boolean(introductionText.trim()),
        summary: Boolean(summaryText.trim()),
        objectives: objectives.length > 0,
        competencies: competencies.length > 0,
        keyConcepts: keyConcepts.length > 0,
        glossary: glossary.length > 0,
        practicalCase: Boolean(caseDescription.trim()),
        practicalActivity: Boolean(activityInstructions.trim()),
        conclusion: Boolean(conclusionText.trim()),
        bibliography: bibliography.length > 0,
      },
    };
  }
}
