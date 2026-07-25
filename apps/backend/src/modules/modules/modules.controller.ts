import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Request,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  UseGuards,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { ModulesService } from "./modules.service";
import { PDFParse } from "pdf-parse";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { Role } from "@prisma/client";

@ApiTags("Módulos Teóricos")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("modules/theory")
export class ModulesController {
  constructor(private readonly modulesService: ModulesService) {}

  @Get()
  @ApiOperation({ summary: "Obtener plan de estudios de 10 meses teóricos" })
  @ApiResponse({ status: 200, description: "Lista de módulos teóricos" })
  async getModules() {
    return this.modulesService.getTheoreticalModules();
  }

  @Get(":id")
  @ApiOperation({
    summary: "Obtener detalle de un módulo teórico con sus evaluaciones",
  })
  @ApiResponse({ status: 200, description: "Detalle del módulo" })
  async getModuleById(@Param("id") id: string) {
    return this.modulesService.getModuleById(id);
  }

  @Post("parse-pdf")
  @Roles(Role.ADMIN, Role.ASSISTANT)
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor("file"))
  @ApiOperation({
    summary: "Escanear archivo (PDF/MD/TXT) y autocompletar secciones",
  })
  @ApiConsumes("multipart/form-data", "application/json")
  async parsePdf(
    @UploadedFile() file?: Express.Multer.File,
    @Body("text") bodyText?: string,
  ) {
    if (file) {
      let textContent = "";

      if (
        file.mimetype === "application/pdf" ||
        file.originalname.endsWith(".pdf")
      ) {
        const parser = new PDFParse({ data: file.buffer });
        const parsed = await parser.getText();
        textContent = parsed.text;
      } else {
        textContent = file.buffer.toString("utf-8");
      }

      return this.modulesService.parsePdfClassText(textContent);
    }

    return this.modulesService.parsePdfClassText(bodyText || "");
  }

  @Post()
  @Roles(Role.ADMIN, Role.ASSISTANT)
  @ApiOperation({ summary: "Crear nueva clase teórica" })
  async createModule(@Body() body: any) {
    return this.modulesService.createTheoreticalModule(body);
  }

  @Put(":id")
  @Roles(Role.ADMIN, Role.ASSISTANT)
  @ApiOperation({
    summary: "Actualizar clase teórica y guardar visibilidad de secciones",
  })
  async updateModule(@Param("id") id: string, @Body() body: any) {
    return this.modulesService.updateTheoreticalModule(id, body);
  }

  @Delete(":id")
  @Roles(Role.ADMIN, Role.ASSISTANT)
  @ApiOperation({ summary: "Eliminar una clase teórica de Supabase" })
  async deleteModule(@Param("id") id: string) {
    return this.modulesService.deleteTheoreticalModule(id);
  }

  @Post("evaluations/:id/submit")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Enviar respuestas de autoevaluación interactiva" })
  @ApiResponse({ status: 200, description: "Resultado de la autoevaluación" })
  async submitQuiz(
    @Request() req: any,
    @Param("id") evaluationId: string,
    @Body("answers") answers: number[],
  ) {
    return this.modulesService.submitQuiz(
      req.user.userId,
      evaluationId,
      answers || [],
    );
  }
}
