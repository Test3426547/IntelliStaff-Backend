import { ExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { AuditLoggingService } from '../../audit-logging/audit-logging.service';
import { SentryService } from '../services/sentry.service';
export declare class GlobalExceptionFilter implements ExceptionFilter {
    private readonly auditLoggingService;
    private readonly sentryService;
    private readonly logger;
    constructor(auditLoggingService: AuditLoggingService, sentryService: SentryService);
    catch(exception: unknown, host: ArgumentsHost): Promise<void>;
    private getErrorCodeFromStatus;
    private getStatusFromErrorCode;
}
