import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

// Memoria volátil para códigos OTP de prueba y verificación
const otpStore = new Map<string, { code: string; expiresAt: number }>();

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async validateFranchiseCode(code: string) {
    const cleanCode = code.trim().toUpperCase();
    const franchise = await this.prisma.franchise.findUnique({
      where: { code: cleanCode },
    });

    if (!franchise || !franchise.isActive) {
      throw new BadRequestException('El código de franquicia proporcionado no es válido o está inactivo.');
    }

    return franchise;
  }

  async register(registerDto: RegisterDto) {
    const franchise = await this.validateFranchiseCode(registerDto.franchiseCode);
    const cleanEmail = registerDto.email.toLowerCase().trim();

    const existingUser = await this.prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      throw new ConflictException('Ya existe un usuario registrado con este correo electrónico.');
    }

    const passwordHash = await bcrypt.hash(registerDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: cleanEmail,
        passwordHash,
        fullName: registerDto.fullName,
        role: 'STUDENT',
        enrollmentStatus: 'PENDING_PAYMENT',
        currentPhase: 'THEORY',
        franchiseId: franchise.id,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        enrollmentStatus: true,
        currentPhase: true,
        franchise: {
          select: {
            code: true,
            name: true,
          },
        },
      },
    });

    // Generar código OTP real de 6 dígitos
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(cleanEmail, {
      code: otpCode,
      expiresAt: Date.now() + 15 * 60 * 1000, // Expiración en 15 minutos
    });

    // Enviar correo real con MailService
    await this.mailService.sendOtpEmail(cleanEmail, otpCode, 'verification');

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    const isDev = process.env.NODE_ENV !== 'production';

    return {
      message: 'Registro exitoso. Se envió un código de verificación de 6 dígitos.',
      user,
      accessToken,
      ...(isDev ? { otpCode } : {}),
    };
  }

  async forgotPassword(email: string) {
    const cleanEmail = email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      throw new BadRequestException('No encontramos un usuario registrado con este correo.');
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(cleanEmail, {
      code: otpCode,
      expiresAt: Date.now() + 15 * 60 * 1000,
    });

    await this.mailService.sendOtpEmail(cleanEmail, otpCode, 'password_recovery');

    const isDev = process.env.NODE_ENV !== 'production';

    return {
      message: 'Se envió un código de verificación para restablecer tu contraseña.',
      ...(isDev ? { otpCode } : {}),
    };
  }

  async resetPassword(email: string, newPassword: string) {
    const cleanEmail = email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      throw new BadRequestException('Usuario no encontrado.');
    }

    if (!newPassword || newPassword.trim().length < 6) {
      throw new BadRequestException('La contraseña debe tener al menos 6 caracteres.');
    }

    // Validar que la nueva contraseña no sea igual a la contraseña anterior
    const isSamePassword = await bcrypt.compare(newPassword.trim(), user.passwordHash);
    if (isSamePassword) {
      throw new BadRequestException('La nueva contraseña no puede ser igual a la contraseña anterior.');
    }

    const newPasswordHash = await bcrypt.hash(newPassword.trim(), 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newPasswordHash },
    });

    return {
      message: 'Contraseña restablecida con éxito. Ya podés iniciar sesión con tu nueva clave.',
    };
  }

  async resendOtp(email: string) {
    const cleanEmail = email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      throw new BadRequestException('No existe un usuario con este correo electrónico.');
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(cleanEmail, {
      code: otpCode,
      expiresAt: Date.now() + 15 * 60 * 1000,
    });

    await this.mailService.sendOtpEmail(cleanEmail, otpCode, 'verification');

    const isDev = process.env.NODE_ENV !== 'production';

    return {
      message: 'Código de verificación reenviado con éxito.',
      ...(isDev ? { otpCode } : {}),
    };
  }

  async verifyOtp(email: string, code: string) {
    const cleanEmail = email.toLowerCase().trim();
    const storedOtp = otpStore.get(cleanEmail);

    const isDev = process.env.NODE_ENV !== 'production';
    const isUniversalDevCode = isDev && code === '123456';
    const isValidOtp = storedOtp && storedOtp.code === code && Date.now() < storedOtp.expiresAt;

    if (isUniversalDevCode || isValidOtp) {
      otpStore.delete(cleanEmail);

      const user = await this.prisma.user.findUnique({
        where: { email: cleanEmail },
      });

      if (!user) {
        throw new BadRequestException('Usuario no encontrado.');
      }

      const payload = { sub: user.id, email: user.email, role: user.role };
      const accessToken = this.jwtService.sign(payload);

      return {
        message: 'Cuenta verificada con éxito.',
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        },
        accessToken,
      };
    }

    throw new BadRequestException('El código de verificación ingresado es incorrecto o ha expirado.');
  }

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email.toLowerCase().trim() },
      include: {
        franchise: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas.');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas.');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      message: 'Inicio de sesión exitoso',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        enrollmentStatus: user.enrollmentStatus,
        currentPhase: user.currentPhase,
        franchise: user.franchise ? { code: user.franchise.code, name: user.franchise.name } : null,
      },
      accessToken,
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        language: true,
        enrollmentStatus: true,
        currentPhase: true,
        franchise: {
          select: {
            code: true,
            name: true,
            location: true,
          },
        },
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado.');
    }

    return user;
  }
}
