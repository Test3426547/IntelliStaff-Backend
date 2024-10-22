import { ConfigService } from '@nestjs/config';
export declare class DatabaseSetupService {
    private configService;
    private supabase;
    constructor(configService: ConfigService);
    setupDatabase(): Promise<void>;
}
