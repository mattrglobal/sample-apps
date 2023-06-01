import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable, throwError, tap, catchError } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  public intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, path } = request;
    const reqSrc = `${method} ${path}`;

    this.logger.log(
      `Request from ${reqSrc} -> Invoked ${context.getClass().name}.${
        context.getHandler().name
      }()`,
    );

    const now = Date.now();
    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse<Response>();

        this.logger.log(`${reqSrc} took ${Date.now() - now}ms to complete`);
        this.logger.debug(`Response: ${response.statusCode}`);
      }),
      catchError((err) => {
        this.logger.error(err.data.message);
        return throwError(() => err);
      }),
    );
  }
}
