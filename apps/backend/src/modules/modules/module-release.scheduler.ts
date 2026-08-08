import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
  Inject,
  forwardRef,
  Optional,
} from "@nestjs/common";
import { ModuleStatus } from "@iltct/db";
import { PrismaService } from "../prisma/prisma.service";
import { NotificationsService } from "../notifications/notifications.service";
import { RealtimeGateway } from "../realtime/realtime.gateway";

/**
 * Liberación automática de módulos teóricos (FASE 2).
 *
 * Flujo esperado:
 * 1. En el CRM se crea el módulo en DRAFT con `releaseDate` = próximo sábado (o la fecha pactada).
 * 2. Este job corre al arrancar y **cada hora**.
 * 3. Cuando `now >= releaseDate`, pasa DRAFT → PUBLISHED y dispara push/realtime.
 *
 * No hace falta un cron "solo sábados": la fecha la define el contenido.
 * El desbloqueo por alumna (gamificación) sigue en ProgressService (aprobar quiz ≥7).
 */
@Injectable()
export class ModuleReleaseScheduler
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(ModuleReleaseScheduler.name);
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly prisma: PrismaService,
    @Optional()
    @Inject(forwardRef(() => NotificationsService))
    private readonly notificationsService?: NotificationsService,
    @Optional()
    @Inject(forwardRef(() => RealtimeGateway))
    private readonly realtimeGateway?: RealtimeGateway,
  ) {}

  onModuleInit() {
    void this.publishDueModules();
    this.timer = setInterval(
      () => {
        void this.publishDueModules();
      },
      60 * 60 * 1000,
    );
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  async publishDueModules() {
    const now = new Date();
    const due = await this.prisma.theoreticalModule.findMany({
      where: {
        status: ModuleStatus.DRAFT,
        releaseDate: { lte: now },
      },
      select: { id: true, title: true, releaseDate: true, month: true, week: true },
    });

    if (due.length === 0) return due;

    await this.prisma.theoreticalModule.updateMany({
      where: { id: { in: due.map((m) => m.id) } },
      data: { status: ModuleStatus.PUBLISHED },
    });

    this.logger.log(
      `Liberación automática: ${due.length} módulo(s) publicados (${due.map((m) => m.title).join(", ")})`,
    );

    if (this.notificationsService || this.realtimeGateway) {
      for (const mod of due) {
        this.realtimeGateway?.emitToAllStudents("module:released", {
          moduleId: mod.id,
          title: mod.title,
          month: mod.month,
          week: mod.week,
        });

        void this.notificationsService
          ?.sendToAllStudents(
            "Nueva clase disponible",
            `Mes ${mod.month} · Semana ${mod.week}: ${mod.title}`,
            { type: "module_released", moduleId: mod.id },
          )
          .catch((err) =>
            this.logger.warn(`Push módulo liberado: ${err.message}`),
          );
      }
    }

    return due;
  }
}
