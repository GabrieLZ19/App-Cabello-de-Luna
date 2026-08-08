import { Module } from "@nestjs/common";
import { PrismaModule } from "./modules/prisma/prisma.module";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { ModulesModule } from "./modules/modules/modules.module";
import { PracticesModule } from "./modules/practices/practices.module";
import { MailModule } from "./modules/mail/mail.module";
import { FranchisesModule } from "./modules/franchises/franchises.module";
import { HealthModule } from "./modules/health/health.module";
import { ProgressModule } from "./modules/progress/progress.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { RealtimeModule } from "./modules/realtime/realtime.module";

@Module({
  imports: [
    PrismaModule,
    MailModule,
    AuthModule,
    UsersModule,
    ModulesModule,
    PracticesModule,
    FranchisesModule,
    HealthModule,
    ProgressModule,
    NotificationsModule,
    RealtimeModule,
  ],
})
export class AppModule {}
