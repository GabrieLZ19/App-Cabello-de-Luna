import { Injectable, NotFoundException } from "@nestjs/common";
import { ModuleProgressStatus, ModuleStatus, Phase } from "@iltct/db";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ProgressService {
  constructor(private readonly prisma: PrismaService) {}

  private sortModules<
    T extends { month: number; week: number; order: number },
  >(modules: T[]): T[] {
    return [...modules].sort((a, b) => {
      if (a.month !== b.month) return a.month - b.month;
      if (a.week !== b.week) return a.week - b.week;
      return a.order - b.order;
    });
  }

  private computeCourseMonth(theoryStartedAt: Date | null | undefined): number {
    const start = theoryStartedAt ? new Date(theoryStartedAt) : new Date();
    const now = new Date();
    const months =
      (now.getFullYear() - start.getFullYear()) * 12 +
      (now.getMonth() - start.getMonth()) +
      1;
    return Math.min(17, Math.max(1, months));
  }

  private isModuleReleased(module: {
    status: ModuleStatus;
    releaseDate: Date | null;
  }): boolean {
    if (module.status !== ModuleStatus.PUBLISHED) return false;
    if (!module.releaseDate) return true;
    return new Date(module.releaseDate) <= new Date();
  }

  async ensureProgressInitialized(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException("Usuario no encontrado.");

    if (!user.theoryStartedAt) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { theoryStartedAt: user.createdAt || new Date() },
      });
    }

    const modules = this.sortModules(
      await this.prisma.theoreticalModule.findMany({
        where: { status: { in: [ModuleStatus.PUBLISHED, ModuleStatus.DRAFT] } },
        select: {
          id: true,
          month: true,
          week: true,
          order: true,
          status: true,
          releaseDate: true,
        },
      }),
    );

    if (modules.length === 0) return;

    const existing = await this.prisma.moduleProgress.findMany({
      where: { userId },
    });
    const existingByModule = new Map(existing.map((p) => [p.moduleId, p]));

    const released = modules.filter((m) => this.isModuleReleased(m));
    const firstReleasedId = released[0]?.id;

    for (const mod of modules) {
      if (existingByModule.has(mod.id)) continue;
      const isFirst = mod.id === firstReleasedId;
      await this.prisma.moduleProgress.create({
        data: {
          userId,
          moduleId: mod.id,
          status: isFirst
            ? ModuleProgressStatus.AVAILABLE
            : ModuleProgressStatus.LOCKED,
          startedAt: isFirst ? new Date() : null,
        },
      });
    }

    // If user has no AVAILABLE/IN_PROGRESS/COMPLETED yet, unlock first released
    const current = await this.prisma.moduleProgress.findMany({
      where: { userId },
    });
    const openStatuses: ModuleProgressStatus[] = [
      ModuleProgressStatus.AVAILABLE,
      ModuleProgressStatus.IN_PROGRESS,
      ModuleProgressStatus.COMPLETED,
    ];
    const hasOpen = current.some((p) => openStatuses.includes(p.status));
    if (!hasOpen && firstReleasedId) {
      await this.prisma.moduleProgress.updateMany({
        where: { userId, moduleId: firstReleasedId },
        data: {
          status: ModuleProgressStatus.AVAILABLE,
          startedAt: new Date(),
        },
      });
    }
  }

  async getMyProgress(userId: string) {
    await this.ensureProgressInitialized(userId);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        currentPhase: true,
        theoryStartedAt: true,
        createdAt: true,
        fullName: true,
        email: true,
      },
    });
    if (!user) throw new NotFoundException("Usuario no encontrado.");

    const modules = this.sortModules(
      await this.prisma.theoreticalModule.findMany({
        where: { status: ModuleStatus.PUBLISHED },
        include: {
          evaluations: { select: { id: true, isFinalExam: true } },
          progressRecords: { where: { userId } },
        },
      }),
    );

    const progressRows = await this.prisma.moduleProgress.findMany({
      where: { userId },
    });
    const progressByModule = new Map(
      progressRows.map((p) => [p.moduleId, p]),
    );

    const publishedReleased = modules.filter((m) => this.isModuleReleased(m));
    const completedTheory = progressRows.filter(
      (p) =>
        p.status === ModuleProgressStatus.COMPLETED &&
        publishedReleased.some((m) => m.id === p.moduleId),
    ).length;
    const totalTheory = Math.max(publishedReleased.length, 1);
    const theoryPercent = Math.round((completedTheory / totalTheory) * 100);

    const practiceModels = await this.prisma.practicalModel.findMany({
      where: { userId },
      include: { cuts: true },
    });
    const approvedCuts = practiceModels.reduce(
      (acc, m) =>
        acc + m.cuts.filter((c) => c.status === "APPROVED").length,
      0,
    );
    const practicePercent = Math.min(
      100,
      Math.round((approvedCuts / 70) * 100),
    );

    const courseMonth = this.computeCourseMonth(
      user.theoryStartedAt || user.createdAt,
    );

    const moduleStates = modules.map((m) => {
      const progress = progressByModule.get(m.id);
      const released = this.isModuleReleased(m);
      let status = progress?.status || ModuleProgressStatus.LOCKED;
      if (!released && status !== ModuleProgressStatus.COMPLETED) {
        status = ModuleProgressStatus.LOCKED;
      }
      return {
        id: m.id,
        title: m.title,
        month: m.month,
        week: m.week,
        order: m.order,
        releaseDate: m.releaseDate,
        released,
        status,
        theorySecondsSpent: progress?.theorySecondsSpent ?? 0,
        activitySecondsSpent: progress?.activitySecondsSpent ?? 0,
        completedAt: progress?.completedAt ?? null,
        isFinalExam: m.evaluations.some((e) => e.isFinalExam),
      };
    });

    const currentModule =
      moduleStates.find(
        (m) =>
          m.status === ModuleProgressStatus.AVAILABLE ||
          m.status === ModuleProgressStatus.IN_PROGRESS,
      ) ||
      moduleStates.find((m) => m.status === ModuleProgressStatus.COMPLETED) ||
      null;

    return {
      userId: user.id,
      fullName: user.fullName,
      email: user.email,
      currentPhase: user.currentPhase,
      courseMonth,
      totalMonths: 17,
      theory: {
        completed: completedTheory,
        total: publishedReleased.length,
        percent: theoryPercent,
        modules: moduleStates,
      },
      practice: {
        approvedCuts,
        totalCuts: 70,
        percent: practicePercent,
        models: practiceModels,
      },
      currentModule,
    };
  }

  async getStudentProgressForAdmin(studentId: string) {
    return this.getMyProgress(studentId);
  }

  async markModuleInProgress(userId: string, moduleId: string) {
    await this.ensureProgressInitialized(userId);
    const row = await this.prisma.moduleProgress.findUnique({
      where: { userId_moduleId: { userId, moduleId } },
    });
    if (!row) return null;
    if (row.status === ModuleProgressStatus.AVAILABLE) {
      return this.prisma.moduleProgress.update({
        where: { id: row.id },
        data: {
          status: ModuleProgressStatus.IN_PROGRESS,
          startedAt: row.startedAt || new Date(),
        },
      });
    }
    return row;
  }

  async recordTimeSpent(
    userId: string,
    moduleId: string,
    data: { theorySeconds?: number; activitySeconds?: number },
  ) {
    await this.ensureProgressInitialized(userId);
    const row = await this.prisma.moduleProgress.findUnique({
      where: { userId_moduleId: { userId, moduleId } },
    });
    if (!row) throw new NotFoundException("Progreso de módulo no encontrado.");

    return this.prisma.moduleProgress.update({
      where: { id: row.id },
      data: {
        theorySecondsSpent:
          data.theorySeconds !== undefined
            ? Math.max(row.theorySecondsSpent, data.theorySeconds)
            : row.theorySecondsSpent,
        activitySecondsSpent:
          data.activitySeconds !== undefined
            ? Math.max(row.activitySecondsSpent, data.activitySeconds)
            : row.activitySecondsSpent,
        status:
          row.status === ModuleProgressStatus.AVAILABLE
            ? ModuleProgressStatus.IN_PROGRESS
            : row.status,
        startedAt: row.startedAt || new Date(),
      },
    });
  }

  async completeModuleAfterQuizPass(
    userId: string,
    moduleId: string,
    options?: { isFinalExam?: boolean },
  ) {
    await this.ensureProgressInitialized(userId);

    await this.prisma.moduleProgress.upsert({
      where: { userId_moduleId: { userId, moduleId } },
      update: {
        status: ModuleProgressStatus.COMPLETED,
        completedAt: new Date(),
      },
      create: {
        userId,
        moduleId,
        status: ModuleProgressStatus.COMPLETED,
        completedAt: new Date(),
        startedAt: new Date(),
      },
    });

    const unlockedModule = await this.unlockNextModule(userId, moduleId);
    const badge = await this.awardModuleBadge(userId, moduleId);

    const modules = this.sortModules(
      await this.prisma.theoreticalModule.findMany({
        where: { status: ModuleStatus.PUBLISHED },
        select: {
          id: true,
          month: true,
          week: true,
          order: true,
          status: true,
          releaseDate: true,
        },
      }),
    );
    const released = modules.filter((m) => this.isModuleReleased(m));
    const progress = await this.prisma.moduleProgress.findMany({
      where: { userId },
    });
    const allDone =
      released.length > 0 &&
      released.every((m) =>
        progress.some(
          (p) =>
            p.moduleId === m.id &&
            p.status === ModuleProgressStatus.COMPLETED,
        ),
      );

    let phaseChanged = false;
    if (allDone || options?.isFinalExam) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (user && user.currentPhase === Phase.THEORY) {
        await this.prisma.user.update({
          where: { id: userId },
          data: { currentPhase: Phase.PRACTICE },
        });
        phaseChanged = true;
        await this.awardHitoBadge(
          userId,
          "Fase Práctica",
          "Completaste la fase teórica y desbloqueaste la práctica clínica.",
          "HITO_PRACTICA",
        );
      }
    }

    return {
      unlockedModule,
      badge,
      phaseChanged,
      newPhase: phaseChanged ? Phase.PRACTICE : undefined,
    };
  }

  private async unlockNextModule(userId: string, completedModuleId: string) {
    const modules = this.sortModules(
      await this.prisma.theoreticalModule.findMany({
        where: { status: ModuleStatus.PUBLISHED },
        select: {
          id: true,
          month: true,
          week: true,
          order: true,
          status: true,
          releaseDate: true,
          title: true,
        },
      }),
    );

    const idx = modules.findIndex((m) => m.id === completedModuleId);
    if (idx < 0) return null;

    for (let i = idx + 1; i < modules.length; i++) {
      const next = modules[i];
      if (!this.isModuleReleased(next)) {
        // Keep locked until releaseDate; still create row
        await this.prisma.moduleProgress.upsert({
          where: { userId_moduleId: { userId, moduleId: next.id } },
          update: {},
          create: {
            userId,
            moduleId: next.id,
            status: ModuleProgressStatus.LOCKED,
          },
        });
        continue;
      }

      const existing = await this.prisma.moduleProgress.findUnique({
        where: { userId_moduleId: { userId, moduleId: next.id } },
      });
      if (existing?.status === ModuleProgressStatus.COMPLETED) continue;

      const unlocked = await this.prisma.moduleProgress.upsert({
        where: { userId_moduleId: { userId, moduleId: next.id } },
        update: {
          status: ModuleProgressStatus.AVAILABLE,
          startedAt: existing?.startedAt || new Date(),
        },
        create: {
          userId,
          moduleId: next.id,
          status: ModuleProgressStatus.AVAILABLE,
          startedAt: new Date(),
        },
      });

      return { ...unlocked, title: next.title, month: next.month, week: next.week };
    }

    return null;
  }

  private async awardModuleBadge(userId: string, moduleId: string) {
    const module = await this.prisma.theoreticalModule.findUnique({
      where: { id: moduleId },
    });
    if (!module) return null;

    const title = `Nivel ${module.month}.${module.week}`;
    let badge = await this.prisma.badge.findFirst({
      where: { title, category: "HITO" },
    });
    if (!badge) {
      badge = await this.prisma.badge.create({
        data: {
          title,
          description: `Completaste ${module.title}`,
          iconName: "award",
          category: "HITO",
        },
      });
    }

    const existing = await this.prisma.userBadge.findUnique({
      where: { userId_badgeId: { userId, badgeId: badge.id } },
    });
    if (existing) return { ...badge, alreadyOwned: true };

    await this.prisma.userBadge.create({
      data: { userId, badgeId: badge.id },
    });
    return { ...badge, alreadyOwned: false };
  }

  private async awardHitoBadge(
    userId: string,
    title: string,
    description: string,
    iconName: string,
  ) {
    let badge = await this.prisma.badge.findFirst({
      where: { title, category: "HITO" },
    });
    if (!badge) {
      badge = await this.prisma.badge.create({
        data: { title, description, iconName, category: "HITO" },
      });
    }
    await this.prisma.userBadge.upsert({
      where: { userId_badgeId: { userId, badgeId: badge.id } },
      update: {},
      create: { userId, badgeId: badge.id },
    });
    return badge;
  }

  async getMyBadges(userId: string) {
    return this.prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
      orderBy: { unlockedAt: "desc" },
    });
  }
}
