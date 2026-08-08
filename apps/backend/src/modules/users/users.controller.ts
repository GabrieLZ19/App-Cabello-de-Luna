import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@iltct/db';

@ApiTags('Usuarios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Obtener lista completa de usuarios registrados en Supabase' })
  async getAllUsers() {
    return this.usersService.getAllUsers();
  }

  @Get('students')
  @Roles(Role.ADMIN, Role.ASSISTANT)
  @ApiOperation({ summary: 'Obtener únicamente la lista de alumnos' })
  async getStudentsOnly() {
    return this.usersService.getStudentsOnly();
  }

  @Get('staff')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Obtener únicamente la lista de personal con roles administrativos' })
  async getStaffUsers() {
    return this.usersService.getStaffUsers();
  }

  @Get('stats')
  @Roles(Role.ADMIN, Role.ASSISTANT)
  @ApiOperation({ summary: 'Obtener métricas reales de cantidad de usuarios por rol' })
  async getStudentStats() {
    return this.usersService.getStudentStats();
  }

  @Post()
  @Roles(Role.ADMIN, Role.ASSISTANT)
  @ApiOperation({ summary: 'Registrar un nuevo usuario o alumno con contraseña y franquicia' })
  async createUser(@Body() body: any) {
    return this.usersService.createUser(body);
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.ASSISTANT)
  @ApiOperation({ summary: 'Actualizar rol, estado o datos de un usuario' })
  async updateUser(@Param('id') id: string, @Body() body: any) {
    return this.usersService.updateUser(id, body);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Eliminar o deshabilitar un usuario en Supabase' })
  async deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }

  @Get('profile/:id')
  @Roles(Role.ADMIN, Role.ASSISTANT, Role.STUDENT)
  @ApiOperation({ summary: 'Obtener información de perfil de un usuario' })
  async getProfile(@Param('id') id: string) {
    return this.usersService.getProfile(id);
  }
}

