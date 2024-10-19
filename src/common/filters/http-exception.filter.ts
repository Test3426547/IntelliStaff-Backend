import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuditLoggingService } from '../../audit-logging/audit-logging.service';
import { EventEmitterService } from '../events/event.emitter';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly auditLoggingService: AuditLoggingService,
    private readonly eventEmitter: EventEmitterService,
  ) {}

  async catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = 
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = 
      exception instanceof HttpException
        ? exception.message
        : 'Internal server error';

    const errorResponse = {
      statusCode: status,
      message: message,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      errorDetails: exception instanceof Error ? exception.stack : undefined,
    };

    // Log the error
    await this.auditLoggingService.logAction('system', 'error', errorResponse);

    // Emit an error event
    this.eventEmitter.emit('error', errorResponse);

    // Remove errorDetails from the response to avoid exposing sensitive information
    delete errorResponse.errorDetails;

    response.status(status).json(errorResponse);
  }
}
