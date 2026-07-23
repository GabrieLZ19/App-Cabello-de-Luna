import { Controller, Post, Get, Body, HttpCode, HttpStatus, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión en la app o CRM' })
  @ApiResponse({ status: 200, description: 'Login exitoso' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('validate-franchise')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validar código de franquicia antes del registro' })
  @ApiResponse({ status: 200, description: 'Código de franquicia válido' })
  @ApiResponse({ status: 400, description: 'Código de franquicia inválido' })
  async validateFranchise(@Body('code') code: string) {
    const franchise = await this.authService.validateFranchiseCode(code || '');
    return {
      valid: true,
      franchise: {
        code: franchise.code,
        name: franchise.name,
        location: franchise.location,
      },
    };
  }

  @Post('register')
  @ApiOperation({ summary: 'Registro de alumno mediante código de franquicia' })
  @ApiResponse({ status: 201, description: 'Registro exitoso' })
  @ApiResponse({ status: 400, description: 'Código de franquicia inválido o deshabilitado' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Solicitar código de recuperación de contraseña' })
  @ApiResponse({ status: 200, description: 'Código enviado por correo con éxito' })
  @ApiResponse({ status: 400, description: 'Usuario no encontrado' })
  async forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email || '');
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Establecer nueva contraseña tras la verificación OTP' })
  @ApiResponse({ status: 200, description: 'Contraseña restablecida con éxito' })
  @ApiResponse({ status: 400, description: 'Usuario o clave no válidos' })
  async resetPassword(@Body('email') email: string, @Body('newPassword') newPassword: string) {
    return this.authService.resetPassword(email || '', newPassword || '');
  }

  @Post('resend-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reenviar código OTP de 6 dígitos por correo' })
  @ApiResponse({ status: 200, description: 'Nuevo código enviado con éxito' })
  @ApiResponse({ status: 400, description: 'Usuario no encontrado' })
  async resendOtp(@Body('email') email: string) {
    return this.authService.resendOtp(email || '');
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verificar código OTP de 6 dígitos enviado por correo' })
  @ApiResponse({ status: 200, description: 'Código verificado con éxito' })
  @ApiResponse({ status: 400, description: 'Código inválido o expirado' })
  async verifyOtp(@Body('email') email: string, @Body('code') code: string) {
    return this.authService.verifyOtp(email || '', code || '');
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Perfil retornado con éxito' })
  async getProfile(@Request() req: any) {
    return this.authService.getProfile(req.user.userId);
  }
}
