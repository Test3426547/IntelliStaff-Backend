import { ExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { AuditLoggingService } from '../../audit-logging/audit-logging.service';
import { EventEmitterService } from '../events/event.emitter';
export declare class HttpExceptionFilter implements ExceptionFilter {
    private readonly auditLoggingService;
    private readonly eventEmitter;
    constructor(auditLoggingService: AuditLoggingService, eventEmitter: EventEmitterService);
    catch(exception: unknown, host: ArgumentsHost): Promise<void>;
}
