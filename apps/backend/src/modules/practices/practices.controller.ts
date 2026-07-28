import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  BadRequestException,
  Param,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { PracticesService } from "./practices.service";
import { StorageService } from "./storage.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@ApiTags("Prácticas Clínicas")
@UseGuards(JwtAuthGuard) // <-- SOLO JwtAuthGuard (sin RolesGuard que restrinja a ADMIN)
@ApiBearerAuth()
@Controller("practices")
export class PracticesController {
  constructor(
    private readonly practicesService: PracticesService,
    private readonly storageService: StorageService,
  ) {}

  @Get("my-cuts")
  @ApiOperation({
    summary: "Obtener modelos y evidencias cargadas por la alumna",
  })
  async getMyPractices(@Request() req: any) {
    return this.practicesService.getStudentPractices(req.user.userId);
  }

  @Post("submit")
  @ApiOperation({ summary: "Guardar evidencia de corte con fotos en Base64" })
  async submitEvidence(
    @Request() req: any,
    @Body()
    body: {
      modelName: string;
      modelNumber: number;
      cutNumber: number;
      lunarPhase: string;
      photoBeforeBase64: string;
      photoAfterBase64: string;
      technicalSheetText: string;
    },
  ) {
    if (!body.photoBeforeBase64 || !body.photoAfterBase64) {
      throw new BadRequestException(
        "Faltan fotografías de evidencia (Antes/Después).",
      );
    }

    const userId = req.user.userId;

    // Convertir Base64 a Buffers binarios
    const beforeBuffer = Buffer.from(
      body.photoBeforeBase64.replace(/^data:image\/\w+;base64,/, ""),
      "base64",
    );
    const afterBuffer = Buffer.from(
      body.photoAfterBase64.replace(/^data:image\/\w+;base64,/, ""),
      "base64",
    );

    // Subir a Supabase Storage
    const photoBeforeUrl = await this.storageService.uploadImage(
      {
        buffer: beforeBuffer,
        mimetype: "image/jpeg",
        originalname: "before.jpg",
      } as any,
      `user-${userId}/model-${body.modelNumber}`,
    );

    const photoAfterUrl = await this.storageService.uploadImage(
      {
        buffer: afterBuffer,
        mimetype: "image/jpeg",
        originalname: "after.jpg",
      } as any,
      `user-${userId}/model-${body.modelNumber}`,
    );

    // Guardar en Postgres via Prisma
    return this.practicesService.submitCutEvidence(userId, {
      modelName: body.modelName,
      modelNumber: body.modelNumber,
      cutNumber: body.cutNumber,
      lunarPhase: body.lunarPhase,
      photoBeforeUrl,
      photoAfterUrl,
      technicalSheetText: body.technicalSheetText,
    });
  }

  @Get("pending-reviews")
  @ApiOperation({
    summary: "Obtener cortes pendientes de revisión (Instructor/Admin)",
  })
  async getPendingReviews() {
    return this.practicesService.getPendingCutsForReview();
  }

  @Post("review/:cutId")
  @ApiOperation({
    summary: "Evaluar corte y enviar retroalimentación a la alumna",
  })
  async reviewCut(
    @Request() req: any,
    @Param("cutId") cutId: string,
    @Body()
    body: {
      statusResult: "APPROVED" | "CORRECTION_REQUIRED";
      comments: string;
    },
  ) {
    return this.practicesService.reviewCut(
      cutId,
      req.user.userId,
      body.statusResult,
      body.comments,
    );
  }
}
