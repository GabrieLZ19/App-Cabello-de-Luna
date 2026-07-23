import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
  // Escuchar en 0.0.0.0 para aceptar peticiones de dispositivos físicos y emuladores en la red local Wi-Fi
  await app.listen(port, '0.0.0.0');
  console.log(`API corriendo en http://0.0.0.0:${port}/api/v1`);
  console.log(`Documentación Swagger en http://localhost:${port}/api/docs`);
}

bootstrap();
