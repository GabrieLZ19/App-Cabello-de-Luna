import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';

@ApiTags('Usuarios')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener lista completa de usuarios registrados en Supabase' })
  async getAllUsers() {
    return this.usersService.getAllUsers();
  }

  @Get('students')
  @ApiOperation({ summary: 'Obtener únicamente la lista de alumnos' })
  async getStudentsOnly() {
    return this.usersService.getStudentsOnly();
  }

  @Get('staff')
  @ApiOperation({ summary: 'Obtener únicamente la lista de personal con roles administrativos' })
  async getStaffUsers() {
    return this.usersService.getStaffUsers();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obtener métricas reales de cantidad de usuarios por rol' })
  async getStudentStats() {
    return this.usersService.getStudentStats();
  }

  @Post()
  @ApiOperation({ summary: 'Registrar un nuevo usuario o alumno con contraseña y franquicia' })
  async createUser(@Body() body: any) {
    return this.usersService.createUser(body);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar rol, estado o datos de un usuario' })
  async updateUser(@Param('id') id: string, @Body() body: any) {
    return this.usersService.updateUser(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar o deshabilitar un usuario en Supabase' })
  async deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }

  @Get('profile/:id')
  @ApiOperation({ summary: 'Obtener información de perfil de un usuario' })
  async getProfile(@Param('id') id: string) {
    return this.usersService.getProfile(id);
  }
}
