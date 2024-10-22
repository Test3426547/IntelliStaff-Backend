import * as Sentry from '@sentry/node';
import { ConfigService } from '@nestjs/config';
export declare class SentryService {
    private configService;
    constructor(configService: ConfigService);
    captureException(exception: any): void;
    captureMessage(message: string, level?: Sentry.Severity): void;
    setExtra(key: string, value: any): void;
    setTag(key: string, value: string): void;
    setUser(user: {
        id: string;
        email?: string;
        username?: string;
    }): void;
}
