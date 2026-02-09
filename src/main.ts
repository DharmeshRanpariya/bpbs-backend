import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MulterExceptionFilter } from './common/filters/multer-exception.filter';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ErrorHandlerInterceptor } from './common/interceptors/error-handler.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new MulterExceptionFilter(), new GlobalExceptionFilter());
  app.useGlobalInterceptors(new ErrorHandlerInterceptor());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
