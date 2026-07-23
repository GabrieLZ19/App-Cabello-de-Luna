import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FranchisesService {
  constructor(private prisma: PrismaService) {}

  async getAllFranchises() {
    return this.prisma.franchise.findMany({
      include: {
        _count: {
          select: { users: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getFranchiseById(id: string) {
    const franchise = await this.prisma.franchise.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            enrollmentStatus: true,
          },
        },
      },
    });

    if (!franchise) {
      throw new NotFoundException(`Franquicia con ID ${id} no encontrada.`);
    }

    return franchise;
  }

  async createFranchise(data: { code: string; name: string; location?: string; isActive?: boolean }) {
    const code = data.code.trim().toUpperCase();
    const existing = await this.prisma.franchise.findUnique({ where: { code } });

    if (existing) {
      throw new ConflictException(`Ya existe una franquicia registrada con el código ${code}.`);
    }

    return this.prisma.franchise.create({
      data: {
        code,
        name: data.name,
        location: data.location || 'Sede Oficial',
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    });
  }

  async updateFranchise(id: string, data: { code?: string; name?: string; location?: string; isActive?: boolean }) {
    const existing = await this.prisma.franchise.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Franquicia con ID ${id} no encontrada.`);
    }

    const payload: any = {};
    if (data.code) payload.code = data.code.trim().toUpperCase();
    if (data.name !== undefined) payload.name = data.name;
    if (data.location !== undefined) payload.location = data.location;
    if (data.isActive !== undefined) payload.isActive = data.isActive;

    return this.prisma.franchise.update({
      where: { id },
      data: payload,
    });
  }
}
