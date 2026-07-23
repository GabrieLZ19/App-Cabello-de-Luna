import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PracticesService } from './practices.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Prácticas Clínicas')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('practices')
export class PracticesController {
  constructor(private readonly practicesService: PracticesService) {}

  @Get('my-cuts')
  @ApiOperation({ summary: 'Obtener modelos y evidencias de cortes cargadas por la alumna' })
  @ApiResponse({ status: 200, description: 'Lista de prácticas de la alumna' })
  async getMyPractices(@Request() req: any) {
    return this.practicesService.getStudentPractices(req.user.userId);
  }

  @Post('submit')
  @ApiOperation({ summary: 'Enviar evidencia Antes/Después de un corte de modelo para revisión' })
  @ApiResponse({ status: 201, description: 'Evidencia registrada y en estado IN_REVIEW' })
  async submitEvidence(
    @Request() req: any,
    @Body() body: {
      modelName: string;
      modelNumber: number;
      cutNumber: number;
      lunarPhase: string;
      photoBeforeUrl: string;
      photoAfterUrl: string;
      technicalSheetText: string;
    }
  ) {
    return this.practicesService.submitCutEvidence(req.user.userId, body);
  }
}
