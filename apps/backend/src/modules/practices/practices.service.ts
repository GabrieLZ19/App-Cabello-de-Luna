import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PracticesService {
  constructor(private prisma: PrismaService) {}

  async getStudentPractices(userId: string) {
    return this.prisma.practicalModel.findMany({
      where: { userId },
      orderBy: { modelNumber: 'asc' },
      include: {
        cuts: {
          orderBy: { cutNumber: 'asc' },
          include: {
            evidence: true,
            feedbacks: {
              include: {
                instructor: {
                  select: {
                    fullName: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async submitCutEvidence(userId: string, data: {
    modelName: string;
    modelNumber: number;
    cutNumber: number;
    lunarPhase: string;
    photoBeforeUrl: string;
    photoAfterUrl: string;
    technicalSheetText: string;
  }) {
    // Buscar o crear el modelo práctico
    let model = await this.prisma.practicalModel.findFirst({
      where: { userId, modelNumber: data.modelNumber },
    });

    if (!model) {
      model = await this.prisma.practicalModel.create({
        data: {
          userId,
          modelNumber: data.modelNumber,
          modelName: data.modelName,
          lunarPhaseAssigned: data.lunarPhase,
          status: 'IN_PROGRESS',
        },
      });
    }

    // Crear la entrada del corte con su evidencia
    const cut = await this.prisma.cut.create({
      data: {
        modelId: model.id,
        cutNumber: data.cutNumber,
        lunarPhase: data.lunarPhase,
        status: 'IN_REVIEW',
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

    return cut;
  }
}
