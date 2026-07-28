import "dotenv/config";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { json, urlencoded } from "express";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(json({ limit: "50mb" }));
  app.use(urlencoded({ extended: true, limit: "50mb" }));

  app.enableCors();
  app.setGlobalPrefix("api/v1");

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle("ILTCT · Método Cabello de Luna API")
    .setDescription(
      "API REST backend para la plataforma educativa ILTCT (Móvil y CRM Web)",
    )
    .setVersion("1.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port, "0.0.0.0");

  const baseUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${port}`;
  console.log(`API corriendo en ${baseUrl}/api/v1`);
  console.log(`Documentación Swagger en ${baseUrl}/api/docs`);
}

bootstrap();
