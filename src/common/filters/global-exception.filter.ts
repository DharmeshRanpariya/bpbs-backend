import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        let message = exception.message || 'Internal server error';

        // Handle Mongoose duplicate key error
        if (exception.code === 11000) {
            status = HttpStatus.CONFLICT;
            const field = Object.keys(exception.keyPattern)[0];
            message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
        }

        // Handle NestJS validation errors (from ValidationPipe)
        const exceptionResponse: any = exception instanceof HttpException ? exception.getResponse() : null;
        if (exceptionResponse && typeof exceptionResponse === 'object' && exceptionResponse.message) {
            message = Array.isArray(exceptionResponse.message)
                ? exceptionResponse.message[0]
                : exceptionResponse.message;
        }

        response.status(status).json({
            success: false,
            message: message,
            data: null,
        });
    }
}
