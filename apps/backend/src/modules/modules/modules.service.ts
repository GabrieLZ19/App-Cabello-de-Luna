import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PdfParserService, ParsedModuleSections } from './pdf-parser.service';
import { ModuleStatus } from '@iltct/db';

@Injectable()
export class ModulesService {
  constructor(
    private prisma: PrismaService,
    private pdfParserService: PdfParserService,
  ) {}

  parsePdfClassText(rawText: string): ParsedModuleSections {
    if (!rawText || !rawText.trim()) {
      throw new BadRequestException('Se requiere ingresar el texto del documento para escanear.');
    }
    return this.pdfParserService.parseClassText(rawText);
  }

  async createTheoreticalModule(data: any) {
    let avatarId = data.avatarId;

    if (avatarId) {
      const avatarExists = await this.prisma.avatar.findUnique({ where: { id: avatarId } });
      if (!avatarExists) avatarId = null;
    }

    if (!avatarId) {
      const existingAvatar = await this.prisma.avatar.findFirst();
      if (!existingAvatar) {
        throw new BadRequestException('No existe ningún Avatar de IA registrado en la base de datos para asociar a la clase.');
      }
      avatarId = existingAvatar.id;
    }

    const validStatus = Object.values(ModuleStatus).includes(data.status)
      ? (data.status as ModuleStatus)
      : ModuleStatus.PUBLISHED;

    return this.prisma.theoreticalModule.create({
      data: {
        month: Number(data.month) || 1,
        week: Number(data.week) || 1,
        title: data.title || '',
        moduleName: data.moduleName || '',
        totalDurationMinutes: Number(data.totalDurationMinutes) || 0,
        level: data.level || '',
        instructorName: data.instructorName || '',
        introductionText: data.introductionText || '',
        summaryText: data.summaryText || '',
        conclusionText: data.conclusionText || '',
        objectivesJson: data.objectivesJson || [],
        competenciesJson: data.competenciesJson || [],
        keyConceptsJson: data.keyConceptsJson || [],
        glossaryJson: data.glossaryJson || [],
        practicalCaseJson: data.practicalCaseJson || null,
        practicalActivityJson: data.practicalActivityJson || null,
        bibliographyJson: data.bibliographyJson || [],
        chaptersJson: data.chaptersJson || [],
        hasVideo: data.hasVideo !== undefined ? Boolean(data.hasVideo) : false,
        status: validStatus,
        sectionTogglesJson: data.sectionTogglesJson || null,
        avatarId,
      },
    });
  }

  async updateTheoreticalModule(id: string, data: any) {
    const existing = await this.prisma.theoreticalModule.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`El módulo teórico con ID ${id} no existe en la base de datos.`);
    }

    let avatarId = data.avatarId !== undefined ? data.avatarId : existing.avatarId;
    if (avatarId) {
      const avatarExists = await this.prisma.avatar.findUnique({ where: { id: avatarId } });
      if (!avatarExists) avatarId = existing.avatarId;
    }

    const updatedStatus = data.status !== undefined && Object.values(ModuleStatus).includes(data.status)
      ? (data.status as ModuleStatus)
      : existing.status;

    return this.prisma.theoreticalModule.update({
      where: { id },
      data: {
        title: data.title !== undefined ? data.title : existing.title,
        moduleName: data.moduleName !== undefined ? data.moduleName : existing.moduleName,
        month: data.month !== undefined ? Number(data.month) : existing.month,
        week: data.week !== undefined ? Number(data.week) : existing.week,
        totalDurationMinutes: data.totalDurationMinutes !== undefined ? Number(data.totalDurationMinutes) : existing.totalDurationMinutes,
        level: data.level !== undefined ? data.level : existing.level,
        instructorName: data.instructorName !== undefined ? data.instructorName : existing.instructorName,
        introductionText: data.introductionText !== undefined ? data.introductionText : existing.introductionText,
        summaryText: data.summaryText !== undefined ? data.summaryText : existing.summaryText,
        conclusionText: data.conclusionText !== undefined ? data.conclusionText : existing.conclusionText,
        objectivesJson: data.objectivesJson !== undefined ? data.objectivesJson : existing.objectivesJson,
        competenciesJson: data.competenciesJson !== undefined ? data.competenciesJson : existing.competenciesJson,
        keyConceptsJson: data.keyConceptsJson !== undefined ? data.keyConceptsJson : existing.keyConceptsJson,
        glossaryJson: data.glossaryJson !== undefined ? data.glossaryJson : existing.glossaryJson,
        practicalCaseJson: data.practicalCaseJson !== undefined ? data.practicalCaseJson : existing.practicalCaseJson,
        practicalActivityJson: data.practicalActivityJson !== undefined ? data.practicalActivityJson : existing.practicalActivityJson,
        bibliographyJson: data.bibliographyJson !== undefined ? data.bibliographyJson : existing.bibliographyJson,
        chaptersJson: data.chaptersJson !== undefined ? data.chaptersJson : existing.chaptersJson,
        hasVideo: data.hasVideo !== undefined ? Boolean(data.hasVideo) : existing.hasVideo,
        status: updatedStatus,
        sectionTogglesJson: data.sectionTogglesJson !== undefined ? data.sectionTogglesJson : existing.sectionTogglesJson,
        avatarId,
      },
    });
  }

  async getTheoreticalModules() {
    return this.prisma.theoreticalModule.findMany({
      orderBy: [{ month: 'asc' }, { week: 'asc' }],
      include: {
        avatar: {
          select: {
            id: true,
            name: true,
            specialty: true,
            avatarVideoUrl: true,
            isMarianaClone: true,
          },
        },
        evaluations: {
          select: {
            id: true,
            title: true,
            passingScore: true,
            totalQuestions: true,
          },
        },
      },
    });
  }

  async getModuleById(id: string) {
    const module = await this.prisma.theoreticalModule.findUnique({
      where: { id },
      include: {
        avatar: true,
        evaluations: {
          include: {
            questions: true,
          },
        },
      },
    });

    if (!module) {
      throw new NotFoundException(`Módulo teórico con ID ${id} no fue encontrado en Supabase.`);
    }

    return module;
  }

  async deleteTheoreticalModule(id: string) {
    const existing = await this.prisma.theoreticalModule.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`La clase teórica con ID ${id} no fue encontrada en Supabase.`);
    }

    return this.prisma.theoreticalModule.delete({
      where: { id },
    });
  }

  async submitQuiz(userId: string, evaluationId: string, userAnswers: number[]) {
    const evaluation = await this.prisma.evaluation.findUnique({
      where: { id: evaluationId },
      include: { questions: true },
    });

    if (!evaluation) {
      throw new NotFoundException('Evaluación no encontrada en la base de datos.');
    }

    const safeAnswers = Array.isArray(userAnswers) ? userAnswers : [];
    let correctCount = 0;
    evaluation.questions.forEach((q, idx) => {
      if (safeAnswers[idx] !== undefined && safeAnswers[idx] === q.correctAnswerIndex) {
        correctCount++;
      }
    });

    const total = evaluation.questions.length || 1;
    const score = Math.round((correctCount / total) * 10);
    const passed = score >= evaluation.passingScore;

    const attempt = await this.prisma.evaluationAttempt.create({
      data: {
        userId,
        evaluationId,
        score,
        passed,
        answers: safeAnswers,
        completedAt: new Date(),
      },
    });

    return {
      message: passed ? '¡Felicitaciones! Has aprobado la autoevaluación.' : 'Autoevaluación completada. Podés repasar la lección e intentarlo de nuevo.',
      attemptId: attempt.id,
      score,
      passingScore: evaluation.passingScore,
      passed,
      correctAnswers: correctCount,
      totalQuestions: total,
    };
  }
}
