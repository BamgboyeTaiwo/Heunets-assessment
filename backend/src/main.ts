import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { configureApp } from './bootstrap';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.enableCors({ origin: configService.get<string[]>('corsOrigins'), credentials: true });

  configureApp(app);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('TeamBoard API')
    .setDescription('Authentication, project, and task management endpoints for TeamBoard')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, swaggerDocument);

  const port = configService.get<number>('port') ?? 3000;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`TeamBoard API listening on http://localhost:${port}/api`);
  // eslint-disable-next-line no-console
  console.log(`Swagger docs available at http://localhost:${port}/api/docs`);
}

bootstrap();
