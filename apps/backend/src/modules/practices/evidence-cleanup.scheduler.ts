import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { StorageService } from "./storage.service";

/**
 * Limpieza semanal de archivos huérfanos en practice-evidences.
 */
@Injectable()
export class EvidenceCleanupScheduler
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(EvidenceCleanupScheduler.name);
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  onModuleInit() {
    // Primera pasada a las 5 min (deja arrancar el API), luego cada 7 días
    setTimeout(() => void this.runCleanup(), 5 * 60 * 1000);
    this.timer = setInterval(
      () => {
        void this.runCleanup();
      },
      7 * 24 * 60 * 60 * 1000,
    );
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  async runCleanup() {
    try {
      const rows = await this.prisma.evidence.findMany({
        select: {
          photoBeforeUrl: true,
          photoAfterUrl: true,
          videoOptionalUrl: true,
        },
      });
      const refs = rows.flatMap((r) => [
        r.photoBeforeUrl,
        r.photoAfterUrl,
        r.videoOptionalUrl || "",
      ]);
      const result = await this.storageService.cleanupOrphanObjects(refs);
      if (result.removed > 0) {
        this.logger.log(
          `Evidencias: ${result.removed} archivo(s) huérfano(s) eliminados`,
        );
      }
    } catch (err: any) {
      this.logger.warn(`Cleanup de evidencias omitido: ${err.message}`);
    }
  }
}
