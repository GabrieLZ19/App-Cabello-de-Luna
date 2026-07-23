import { Module } from "@nestjs/common";
import { PrismaModule } from "./modules/prisma/prisma.module";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { ModulesModule } from "./modules/modules/modules.module";
import { PracticesModule } from "./modules/practices/practices.module";
import { MailModule } from "./modules/mail/mail.module";
import { FranchisesModule } from "./modules/franchises/franchises.module";

@Module({
  imports: [
    PrismaModule,
    MailModule,
    AuthModule,
    UsersModule,
    ModulesModule,
    PracticesModule,
    FranchisesModule,
  ],
})
export class AppModule {}
