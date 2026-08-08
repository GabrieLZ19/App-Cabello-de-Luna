import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Inject,
  forwardRef,
  Optional,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { NotificationsService } from "../notifications/notifications.service";
import { RealtimeGateway } from "../realtime/realtime.gateway";
import { StorageService } from "./storage.service";

@Injectable()
export class PracticesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    @Optional()
    @Inject(forwardRef(() => NotificationsService))
    private readonly notificationsService?: NotificationsService,
    @Optional()
    @Inject(forwardRef(() => RealtimeGateway))
    private readonly realtimeGateway?: RealtimeGateway,
  ) {}

  /**
   * Obtiene los 10 modelos del alumno con sus cortes ordenados, evidencias y feedbacks
   */
  async getStudentPractices(userId: string) {
    const models = await this.prisma.practicalModel.findMany({
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

    return Promise.all(
      models.map(async (model) => ({
        ...model,
        cuts: await Promise.all(
          model.cuts.map(async (cut) => ({
            ...cut,
            evidence: cut.evidence
              ? await this.storageService.signEvidenceUrls(cut.evidence)
              : null,
          })),
        ),
      })),
    );
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
      videoOptionalUrl?: string | null;
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
      const previous = lastCut.evidence;

      const updatedCut = await this.prisma.cut.update({
        where: { id: lastCut.id },
        data: {
          status: "IN_REVIEW",
          submittedAt: new Date(),
          lunarPhase: data.lunarPhase,
        },
      });

      await this.prisma.evidence.upsert({
        where: { cutId: lastCut.id },
        update: {
          photoBeforeUrl: data.photoBeforeUrl,
          photoAfterUrl: data.photoAfterUrl,
          technicalSheetText: data.technicalSheetText,
          videoOptionalUrl: data.videoOptionalUrl ?? null,
        },
        create: {
          cutId: lastCut.id,
          photoBeforeUrl: data.photoBeforeUrl,
          photoAfterUrl: data.photoAfterUrl,
          technicalSheetText: data.technicalSheetText,
          videoOptionalUrl: data.videoOptionalUrl ?? null,
        },
      });

      // Limpia archivos huérfanos del intento anterior
      if (previous) {
        void this.storageService
          .deleteMany([
            previous.photoBeforeUrl,
            previous.photoAfterUrl,
            previous.videoOptionalUrl,
          ])
          .catch(() => undefined);
      }

      this.notifyStaffNewPractice(userId, {
        cutId: lastCut.id,
        modelNumber: data.modelNumber,
        cutNumber: lastCut.cutNumber,
        modelName: data.modelName,
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
            videoOptionalUrl: data.videoOptionalUrl ?? null,
          },
        },
      },
      include: {
        evidence: true,
      },
    });

    this.notifyStaffNewPractice(userId, {
      cutId: newCut.id,
      modelNumber: data.modelNumber,
      cutNumber: newCut.cutNumber,
      modelName: data.modelName,
    });

    return newCut;
  }

  private async notifyStaffNewPractice(
    userId: string,
    meta: {
      cutId: string;
      modelNumber: number;
      cutNumber: number;
      modelName: string;
    },
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { fullName: true, email: true },
    });

    const payload = {
      ...meta,
      studentId: userId,
      studentName: user?.fullName || "Alumna",
      studentEmail: user?.email || "",
      submittedAt: new Date().toISOString(),
    };

    this.realtimeGateway?.emitToStaff("practice:submitted", payload);
  }

  /**
   * CRM: Obtener cola de cortes pendientes de revisión (IN_REVIEW)
   */
  async getPendingCutsForReview() {
    const cuts = await this.prisma.cut.findMany({
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

    return Promise.all(
      cuts.map(async (cut) => ({
        ...cut,
        evidence: cut.evidence
          ? await this.storageService.signEvidenceUrls(cut.evidence)
          : null,
      })),
    );
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
    const cut = await this.prisma.cut.findUnique({
      where: { id: cutId },
      include: { model: true },
    });
    if (!cut) {
      throw new NotFoundException("Corte no encontrado.");
    }

    const feedback = await this.prisma.feedback.create({
      data: {
        cutId,
        instructorId,
        statusResult,
        comments,
      },
    });

    await this.prisma.cut.update({
      where: { id: cutId },
      data: { status: statusResult },
    });

    if (cut.model?.userId) {
      const approved = statusResult === "APPROVED";
      const title = approved ? "Corte aprobado" : "Corrección requerida";
      const body = approved
        ? `Tu Corte 0${cut.cutNumber} fue aprobado.`
        : `Tu Corte 0${cut.cutNumber} necesita correcciones.`;

      this.realtimeGateway?.emitToUser(cut.model.userId, "practice:reviewed", {
        cutId,
        cutNumber: cut.cutNumber,
        status: statusResult,
        comments,
        title,
        body,
      });

      void this.notificationsService
        ?.sendToUser(cut.model.userId, title, body, {
          type: "practice_feedback",
          cutId,
          status: statusResult,
        })
        .catch(() => undefined);
    }

    return feedback;
  }
}
