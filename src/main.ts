import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MulterExceptionFilter } from './common/filters/multer-exception.filter';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ErrorHandlerInterceptor } from './common/interceptors/error-handler.interceptor';
import { json, urlencoded } from 'express';

// 👇 ADD THIS
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Increase payload limits for JSON and URL-encoded data
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ limit: '50mb', extended: true }));

  app.enableCors({
    origin: [
      'https://admin.bpbs.in',
      'http://localhost:3000',
    ],
    credentials: true,
  });

  app.useGlobalFilters(
    new MulterExceptionFilter(),
    new GlobalExceptionFilter(),
  );

  app.useGlobalInterceptors(new ErrorHandlerInterceptor());
  const config = new DocumentBuilder()
    .setTitle('School Management API')
    .setDescription('All Project API Documentation')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api-docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
