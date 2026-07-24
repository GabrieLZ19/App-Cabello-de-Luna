import { Controller, Get, Post, Put, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FranchisesService } from './franchises.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Franquicias')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('franchises')
export class FranchisesController {
  constructor(private readonly franchisesService: FranchisesService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todas las franquicias con conteo de alumnos de Supabase' })
  async getAllFranchises() {
    return this.franchisesService.getAllFranchises();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de franquicia por ID' })
  async getFranchiseById(@Param('id') id: string) {
    return this.franchisesService.getFranchiseById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear una nueva franquicia en el sistema' })
  async createFranchise(@Body() body: any) {
    return this.franchisesService.createFranchise(body);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar código, sede o estado de una franquicia' })
  async updateFranchise(@Param('id') id: string, @Body() body: any) {
    return this.franchisesService.updateFranchise(id, body);
  }
}

