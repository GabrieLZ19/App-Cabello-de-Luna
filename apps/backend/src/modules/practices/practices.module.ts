import { Module, forwardRef } from "@nestjs/common";
import { PracticesService } from "./practices.service";
import { PracticesController } from "./practices.controller";
import { StorageService } from "./storage.service";
import { EvidenceCleanupScheduler } from "./evidence-cleanup.scheduler";
import { NotificationsModule } from "../notifications/notifications.module";
import { RealtimeModule } from "../realtime/realtime.module";

@Module({
  imports: [
    forwardRef(() => NotificationsModule),
    forwardRef(() => RealtimeModule),
  ],
  controllers: [PracticesController],
  providers: [PracticesService, StorageService, EvidenceCleanupScheduler],
  exports: [PracticesService, StorageService],
})
export class PracticesModule {}
