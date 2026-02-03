import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { MulterError } from 'multer';

@Catch(MulterError)
export class MulterExceptionFilter implements ExceptionFilter {
    catch(exception: MulterError, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        let status = HttpStatus.BAD_REQUEST;
        let message = exception.message;

        switch (exception.code) {
            case 'LIMIT_FILE_SIZE':
                status = HttpStatus.PAYLOAD_TOO_LARGE;
                message = 'File size is too large. Maximum allowed size is 5MB.';
                break;
            case 'LIMIT_FILE_COUNT':
                message = 'Too many files uploaded.';
                break;
            case 'LIMIT_UNEXPECTED_FILE':
                message = 'Unexpected field name for file upload.';
                break;
            default:
                message = exception.message;
        }

        response.status(status).json({
            success: false,
            message: message,
            data: null,
            error: exception.code,
            statusCode: status,
        });
    }
}
