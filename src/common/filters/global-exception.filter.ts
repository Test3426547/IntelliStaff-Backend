
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuditLoggingService } from '../../audit-logging/audit-logging.service';
import { AppError, ErrorCodes } from '../error-codes';
import { SentryService } from '../services/sentry.service';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  constructor(
    private readonly auditLoggingService: AuditLoggingService,
    private readonly sentryService: SentryService
  ) {}

  async catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorCode = ErrorCodes.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message;
      errorCode = this.getErrorCodeFromStatus(status);
    } else if (exception instanceof AppError) {
      errorCode = exception.code;
      message = exception.message;
      status = this.getStatusFromErrorCode(errorCode);
    }

    const errorResponse = {
      statusCode: status,
      errorCode: errorCode,
      message: message,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    };

    // Log the error
    this.logger.error(
      `${request.method} ${request.url}`,
      exception instanceof Error ? exception.stack : 'Unknown error',
      GlobalExceptionFilter.name,
    );

    // Capture exception in Sentry
    this.sentryService.captureException(exception);

    // Add extra context to Sentry
    this.sentryService.setExtra('request_details', {
      url: request.url,
      method: request.method,
      headers: request.headers,
      body: request.body,
      query: request.query,
      params: request.params,
    });

    // Set user information if available
    if (request.user) {
      this.sentryService.setUser({
        id: request.user.id,
        email: request.user.email,
        username: request.user.username,
      });
    }

    // Set Sentry tags
    this.sentryService.setTag('error_code', errorCode);
    this.sentryService.setTag('status_code', status.toString());

    // Audit log the error
    await this.auditLoggingService.logAction('system', 'error', {
      ...errorResponse,
      userId: (request as any).user?.id,
    });

    response.status(status).json(errorResponse);
  }

  private getErrorCodeFromStatus(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return ErrorCodes.INVALID_INPUT;
      case HttpStatus.UNAUTHORIZED:
        return ErrorCodes.UNAUTHORIZED;
      case HttpStatus.FORBIDDEN:
        return ErrorCodes.FORBIDDEN;
      case HttpStatus.NOT_FOUND:
        return ErrorCodes.NOT_FOUND;
      default:
        return ErrorCodes.INTERNAL_SERVER_ERROR;
    }
  }

  private getStatusFromErrorCode(errorCode: string): number {
    switch (errorCode) {
      case ErrorCodes.INVALID_INPUT:
        return HttpStatus.BAD_REQUEST;
      case ErrorCodes.UNAUTHORIZED:
        return HttpStatus.UNAUTHORIZED;
      case ErrorCodes.FORBIDDEN:
        return HttpStatus.FORBIDDEN;
      case ErrorCodes.NOT_FOUND:
        return HttpStatus.NOT_FOUND;
      default:
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }
}
