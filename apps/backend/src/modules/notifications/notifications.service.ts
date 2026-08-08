import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async registerToken(
    userId: string,
    token: string,
    platform?: string,
  ) {
    return this.prisma.devicePushToken.upsert({
      where: { token },
      update: { userId, platform: platform || null, updatedAt: new Date() },
      create: { userId, token, platform: platform || null },
    });
  }

  async unregisterToken(token: string) {
    return this.prisma.devicePushToken.deleteMany({ where: { token } });
  }

  async sendToUser(
    userId: string,
    title: string,
    body: string,
    data?: Record<string, string>,
  ) {
    const tokens = await this.prisma.devicePushToken.findMany({
      where: { userId },
    });
    if (tokens.length === 0) return { sent: 0 };

    return this.sendExpoPush(
      tokens.map((t) => t.token),
      title,
      body,
      data,
    );
  }

  async sendToAllStudents(
    title: string,
    body: string,
    data?: Record<string, string>,
  ) {
    const tokens = await this.prisma.devicePushToken.findMany({
      where: { user: { role: "STUDENT" } },
    });
    if (tokens.length === 0) return { sent: 0 };

    return this.sendExpoPush(
      tokens.map((t) => t.token),
      title,
      body,
      data,
    );
  }

  private async sendExpoPush(
    tokens: string[],
    title: string,
    body: string,
    data?: Record<string, string>,
  ) {
    // El ícono de la notificación es el de la app (nativo).
    // El logo del CRM toast usa /logo.png estático — no hace falta PUSH_LOGO_URL.
    const messages = tokens.map((to) => ({
      to,
      sound: "default" as const,
      title,
      body,
      data: {
        ...(data || {}),
        brand: "ILTCT",
      },
    }));

    try {
      const response = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Accept-Encoding": "gzip, deflate",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messages),
      });

      if (!response.ok) {
        const text = await response.text();
        this.logger.warn(`Expo Push fallo: ${response.status} ${text}`);
        return { sent: 0, error: text };
      }

      const result = await response.json();
      this.logger.log(`Expo Push enviado a ${tokens.length} dispositivo(s)`);
      return { sent: tokens.length, result };
    } catch (err: any) {
      this.logger.error(`Error Expo Push: ${err.message}`);
      return { sent: 0, error: err.message };
    }
  }
}
