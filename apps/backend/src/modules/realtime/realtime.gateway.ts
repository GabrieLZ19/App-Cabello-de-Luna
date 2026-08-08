import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Server, Socket } from "socket.io";

export type RealtimeEvent =
  | "practice:submitted"
  | "practice:reviewed"
  | "module:released";

@WebSocketGateway({
  cors: { origin: "*" },
  namespace: "/realtime",
})
export class RealtimeGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(RealtimeGateway.name);

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        (client.handshake.auth?.token as string) ||
        (client.handshake.headers?.authorization || "")
          .replace(/^Bearer\s+/i, "")
          .trim();

      if (!token) {
        client.disconnect(true);
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET || "cabello-de-luna-secret-key-2026",
      });

      const userId = payload.sub as string;
      const role = (payload.role as string) || "STUDENT";

      client.data.userId = userId;
      client.data.role = role;

      await client.join(`user:${userId}`);
      if (role === "ADMIN" || role === "ASSISTANT" || role === "SUPPORT") {
        await client.join("crm:staff");
      }

      this.logger.log(`WS conectado ${userId} (${role})`);
    } catch (err: any) {
      this.logger.warn(`WS auth fallida: ${err.message}`);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    if (client.data?.userId) {
      this.logger.log(`WS desconectado ${client.data.userId}`);
    }
  }

  @SubscribeMessage("ping")
  handlePing(@ConnectedSocket() client: Socket, @MessageBody() _body: unknown) {
    return { event: "pong", data: { ok: true, userId: client.data.userId } };
  }

  emitToStaff(event: RealtimeEvent, payload: Record<string, unknown>) {
    this.server.to("crm:staff").emit(event, payload);
  }

  emitToUser(
    userId: string,
    event: RealtimeEvent,
    payload: Record<string, unknown>,
  ) {
    this.server.to(`user:${userId}`).emit(event, payload);
  }

  emitToAllStudents(event: RealtimeEvent, payload: Record<string, unknown>) {
    this.server.emit(event, payload);
  }
}
