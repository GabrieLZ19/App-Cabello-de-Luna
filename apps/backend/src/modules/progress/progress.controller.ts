import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { Role } from "@iltct/db";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { ProgressService } from "./progress.service";

@ApiTags("Progreso")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("progress")
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get("me")
  @ApiOperation({ summary: "Progreso 17 meses de la alumna autenticada" })
  async getMyProgress(@Request() req: any) {
    return this.progressService.getMyProgress(req.user.userId);
  }

  @Get("badges/me")
  @ApiOperation({ summary: "Badges desbloqueados de la alumna" })
  async getMyBadges(@Request() req: any) {
    return this.progressService.getMyBadges(req.user.userId);
  }

  @Post("modules/:moduleId/start")
  @ApiOperation({ summary: "Marcar módulo como en progreso" })
  async startModule(
    @Request() req: any,
    @Param("moduleId") moduleId: string,
  ) {
    return this.progressService.markModuleInProgress(
      req.user.userId,
      moduleId,
    );
  }

  @Post("modules/:moduleId/time")
  @ApiOperation({ summary: "Registrar tiempo de teoría/actividades (20+20)" })
  async recordTime(
    @Request() req: any,
    @Param("moduleId") moduleId: string,
    @Body()
    body: { theorySeconds?: number; activitySeconds?: number },
  ) {
    return this.progressService.recordTimeSpent(
      req.user.userId,
      moduleId,
      body,
    );
  }

  @Get("students/:id")
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.ASSISTANT)
  @ApiOperation({ summary: "Progreso individual de un alumno (CRM)" })
  async getStudentProgress(@Param("id") id: string) {
    return this.progressService.getStudentProgressForAdmin(id);
  }
}
