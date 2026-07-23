import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getAllUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        enrollmentStatus: true,
        currentPhase: true,
        franchiseId: true,
        franchise: {
          select: {
            code: true,
            name: true,
            location: true,
          },
        },
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getStudentsOnly() {
    return this.prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        enrollmentStatus: true,
        currentPhase: true,
        franchiseId: true,
        franchise: {
          select: {
            code: true,
            name: true,
            location: true,
          },
        },
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getStaffUsers() {
    return this.prisma.user.findMany({
      where: {
        role: {
          in: ['ADMIN', 'ASSISTANT', 'SUPPORT'],
        },
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        enrollmentStatus: true,
        currentPhase: true,
        franchiseId: true,
        franchise: {
          select: {
            code: true,
            name: true,
            location: true,
          },
        },
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getStudentStats() {
    const totalStudents = await this.prisma.user.count({
      where: { role: 'STUDENT' },
    });
    const totalAdmins = await this.prisma.user.count({
      where: { role: 'ADMIN' },
    });
    const totalAssistants = await this.prisma.user.count({
      where: { role: 'ASSISTANT' },
    });

    return {
      totalStudents,
      totalAdmins,
      totalAssistants,
      totalUsers: totalStudents + totalAdmins + totalAssistants,
    };
  }

  async createUser(data: {
    email: string;
    fullName: string;
    password?: string;
    role?: any;
    franchiseCode?: string;
    franchiseName?: string;
    enrollmentStatus?: any;
    currentPhase?: any;
  }) {
    // Generate bcrypt password hash if password provided, or default hash
    const rawPassword = data.password || 'AlumnoCabello2026!';
    const passwordHash = await bcrypt.hash(rawPassword, 10);

    let franchiseId: string | undefined = undefined;

    if (data.franchiseCode) {
      const code = data.franchiseCode.trim().toUpperCase();
      let franchise = await this.prisma.franchise.findUnique({
        where: { code },
      });
      if (!franchise) {
        franchise = await this.prisma.franchise.create({
          data: {
            code,
            name: data.franchiseName || `Franquicia ${code}`,
            location: 'Sede Oficial',
          },
        });
      }
      franchiseId = franchise.id;
    }

    return this.prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        fullName: data.fullName,
        role: data.role ? data.role : 'STUDENT',
        franchiseId,
        enrollmentStatus: data.enrollmentStatus || 'ACTIVE',
        currentPhase: data.currentPhase || 'THEORY',
      } as any,
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        enrollmentStatus: true,
        currentPhase: true,
        franchiseId: true,
        franchise: {
          select: {
            code: true,
            name: true,
          },
        },
        createdAt: true,
      },
    });
  }

  async updateUser(id: string, data: { fullName?: string; role?: any; enrollmentStatus?: any; currentPhase?: any }) {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado.`);
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        fullName: data.fullName !== undefined ? data.fullName : existing.fullName,
        role: data.role !== undefined ? data.role : existing.role,
        enrollmentStatus: data.enrollmentStatus !== undefined ? data.enrollmentStatus : existing.enrollmentStatus,
        currentPhase: data.currentPhase !== undefined ? data.currentPhase : existing.currentPhase,
      },
    });
  }

  async deleteUser(id: string) {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado.`);
    }

    return this.prisma.user.delete({
      where: { id },
    });
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        franchise: true,
        attempts: true,
        practicalModels: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado.`);
    }

    return user;
  }
}
