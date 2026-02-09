import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ErrorHandlerInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            map((data) => {
                // If the service returned a success: false object, we turn it into an actual exception
                if (data && data.success === false) {
                    let status = HttpStatus.BAD_REQUEST;

                    // Map some common error messages to status codes
                    const message = data.message?.toLowerCase() || '';
                    if (message.includes('not found')) {
                        status = HttpStatus.NOT_FOUND;
                    } else if (message.includes('unauthorized') || message.includes('invalid credentials')) {
                        status = HttpStatus.UNAUTHORIZED;
                    } else if (message.includes('already exists') || message.includes('duplicate')) {
                        status = HttpStatus.CONFLICT;
                    } else if (message.includes('forbidden')) {
                        status = HttpStatus.FORBIDDEN;
                    }

                    throw new HttpException(data.message || 'An error occurred', status);
                }
                return data;
            }),
        );
    }
}
