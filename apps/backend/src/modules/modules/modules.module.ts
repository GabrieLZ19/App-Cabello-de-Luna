import { Module, forwardRef } from '@nestjs/common';
import { ModulesService } from './modules.service';
import { ModulesController } from './modules.controller';
import { PdfParserService } from './pdf-parser.service';
import { ProgressModule } from '../progress/progress.module';
import { ModuleReleaseScheduler } from './module-release.scheduler';
import { NotificationsModule } from '../notifications/notifications.module';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [
    forwardRef(() => ProgressModule),
    forwardRef(() => NotificationsModule),
    forwardRef(() => RealtimeModule),
  ],
  controllers: [ModulesController],
  providers: [ModulesService, PdfParserService, ModuleReleaseScheduler],
  exports: [ModulesService, ModuleReleaseScheduler],
})
export class ModulesModule {}
