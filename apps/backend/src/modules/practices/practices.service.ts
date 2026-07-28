import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class PracticesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obtiene los 10 modelos del alumno con sus cortes ordenados, evidencias y feedbacks
   */
  async getStudentPractices(userId: string) {
    return this.prisma.practicalModel.findMany({
      where: { userId },
      orderBy: { modelNumber: "asc" },
      include: {
        cuts: {
          orderBy: { cutNumber: "asc" },
          include: {
            evidence: true,
            feedbacks: {
              orderBy: { reviewedAt: "desc" },
            },
          },
        },
      },
    });
  }

  /**
   * Envía o corrige la evidencia de un corte con validación estricta secuencial
   */
  async submitCutEvidence(
    userId: string,
    data: {
      modelName: string;
      modelNumber: number;
      cutNumber: number;
      lunarPhase: string;
      photoBeforeUrl: string;
      photoAfterUrl: string;
      technicalSheetText: string;
    },
  ) {
    // 1. Buscar o crear la modelo de práctica para la alumna
    let model = await this.prisma.practicalModel.findFirst({
      where: {
        userId,
        modelNumber: data.modelNumber,
      },
      include: {
        cuts: {
          orderBy: { cutNumber: "asc" },
          include: { evidence: true, feedbacks: true },
        },
      },
    });

    if (!model) {
      model = await this.prisma.practicalModel.create({
        data: {
          userId,
          modelNumber: data.modelNumber,
          modelName: data.modelName,
          status: "IN_PROGRESS",
        },
        include: {
          cuts: {
            orderBy: { cutNumber: "asc" },
            include: { evidence: true, feedbacks: true },
          },
        },
      });
    }

    const cuts = model.cuts;
    const lastCut = cuts.length > 0 ? cuts[cuts.length - 1] : null;

    // -------------------------------------------------------------------------
    // 2. CASO A: RE-SUBIDA / CORRECCIÓN DE UN CORTE RECHAZADO
    // -------------------------------------------------------------------------
    if (lastCut && lastCut.status === "CORRECTION_REQUIRED") {
      // Reutilizamos el corte rechazado existente: cambiamos estado a IN_REVIEW
      const updatedCut = await this.prisma.cut.update({
        where: { id: lastCut.id },
        data: {
          status: "IN_REVIEW",
          submittedAt: new Date(),
          lunarPhase: data.lunarPhase,
        },
      });

      // Actualizamos o creamos la evidencia asociada para ESE mismo corte
      await this.prisma.evidence.upsert({
        where: { cutId: lastCut.id },
        update: {
          photoBeforeUrl: data.photoBeforeUrl,
          photoAfterUrl: data.photoAfterUrl,
          technicalSheetText: data.technicalSheetText,
        },
        create: {
          cutId: lastCut.id,
          photoBeforeUrl: data.photoBeforeUrl,
          photoAfterUrl: data.photoAfterUrl,
          technicalSheetText: data.technicalSheetText,
        },
      });

      return updatedCut;
    }

    // -------------------------------------------------------------------------
    // 3. CASO B: INTENTO DE SUBIR UN NUEVO CORTE SI EL ANTERIOR NO ESTÁ APROBADO
    // -------------------------------------------------------------------------
    if (lastCut && lastCut.status !== "APPROVED") {
      throw new BadRequestException(
        `Debes esperar a que la instructora evalúe y apruebe el Corte 0${lastCut.cutNumber} antes de enviar uno nuevo.`,
      );
    }

    // -------------------------------------------------------------------------
    // 4. CASO C: REGISTRO DE UN NUEVO CORTE SECUENCIAL (N+1)
    // -------------------------------------------------------------------------
    // El número del nuevo corte es simplemente el número del último corte + 1
    const nextCutNumber = lastCut ? lastCut.cutNumber + 1 : 1;

    if (nextCutNumber > 7) {
      throw new BadRequestException(
        "Esta modelo ya completó los 7 cortes requeridos.",
      );
    }

    const newCut = await this.prisma.cut.create({
      data: {
        modelId: model.id,
        cutNumber: nextCutNumber,
        lunarPhase: data.lunarPhase,
        status: "IN_REVIEW",
        submittedAt: new Date(),
        evidence: {
          create: {
            photoBeforeUrl: data.photoBeforeUrl,
            photoAfterUrl: data.photoAfterUrl,
            technicalSheetText: data.technicalSheetText,
          },
        },
      },
      include: {
        evidence: true,
      },
    });

    return newCut;
  }

  /**
   * CRM: Obtener cola de cortes pendientes de revisión (IN_REVIEW)
   */
  async getPendingCutsForReview() {
    return this.prisma.cut.findMany({
      where: {
        status: "IN_REVIEW",
      },
      orderBy: { submittedAt: "asc" },
      include: {
        evidence: true,
        model: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        },
        feedbacks: {
          orderBy: { reviewedAt: "desc" },
          include: {
            instructor: {
              select: { fullName: true },
            },
          },
        },
      },
    });
  }

  /**
   * CRM: Evaluar corte (Aprobar o Solicitar Corrección)
   */
  async reviewCut(
    cutId: string,
    instructorId: string,
    statusResult: "APPROVED" | "CORRECTION_REQUIRED",
    comments: string,
  ) {
    const cut = await this.prisma.cut.findUnique({ where: { id: cutId } });
    if (!cut) {
      throw new NotFoundException("Corte no encontrado.");
    }

    // Crear registro de retroalimentación
    const feedback = await this.prisma.feedback.create({
      data: {
        cutId,
        instructorId,
        statusResult,
        comments,
      },
    });

    // Actualizar el estado del corte
    await this.prisma.cut.update({
      where: { id: cutId },
      data: { status: statusResult },
    });

    return feedback;
  }
}
