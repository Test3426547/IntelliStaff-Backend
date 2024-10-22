import { LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class LoggingService implements LoggerService {
    private configService;
    private readonly logger;
    private supabase;
    constructor(configService: ConfigService);
    log(message: string, context?: string): void;
    error(message: string, trace?: string, context?: string): void;
    warn(message: string, context?: string): void;
    debug(message: string, context?: string): void;
    verbose(message: string, context?: string): void;
    private saveLog;
}
