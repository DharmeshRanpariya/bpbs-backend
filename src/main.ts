import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MulterExceptionFilter } from './common/filters/multer-exception.filter';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ErrorHandlerInterceptor } from './common/interceptors/error-handler.interceptor';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Increase payload limits for JSON and URL-encoded data
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ limit: '50mb', extended: true }));

  app.useGlobalFilters(new MulterExceptionFilter(), new GlobalExceptionFilter());
  app.useGlobalInterceptors(new ErrorHandlerInterceptor());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
