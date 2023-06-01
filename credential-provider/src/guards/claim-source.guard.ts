import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class ClaimSourceGuard implements CanActivate {
  private readonly logger = new Logger(ClaimSourceGuard.name);

  public canActivate(context: ExecutionContext): boolean {
    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const key = `x-api-key`;
    const value = req.headers[key];
    const allowAccess = value !== undefined;
    if (allowAccess) {
      this.logger.log(`Access granted, req.header['${key}']: "${value}"`);
    } else {
      this.logger.error(
        `Access denied, '${key}' key not found in request header`,
      );
    }
    return allowAccess;
  }
}
