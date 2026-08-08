import {
  Body,
  Controller,
  Delete,
  Post,
  Request,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { NotificationsService } from "./notifications.service";

@ApiTags("Notificaciones")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("notifications")
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post("register-token")
  @ApiOperation({ summary: "Registrar token Expo Push del dispositivo" })
  async registerToken(
    @Request() req: any,
    @Body() body: { token: string; platform?: string },
  ) {
    return this.notificationsService.registerToken(
      req.user.userId,
      body.token,
      body.platform,
    );
  }

  @Delete("unregister-token")
  @ApiOperation({ summary: "Eliminar token Expo Push" })
  async unregisterToken(@Body() body: { token: string }) {
    return this.notificationsService.unregisterToken(body.token);
  }
}
