import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Observable, from } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';

@Injectable()
export class ResumeService {
  private supabase: SupabaseClient;
  private readonly logger = new Logger(ResumeService.name);

  constructor(private configService: ConfigService) {
    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL'),
      this.configService.get<string>('SUPABASE_KEY'),
    );
  }

  private retryOperation<T>(operation: () => Promise<T>, maxRetries: number = 3): Observable<T> {
    return from(operation()).pipe(
      retry({
        count: maxRetries,
        delay: (error, retryCount) => {
          this.logger.warn(`Retrying operation. Attempt ${retryCount} of ${maxRetries}`);
          return new Observable(subscriber => {
            setTimeout(() => {
              subscriber.next();
              subscriber.complete();
            }, Math.pow(2, retryCount) * 1000);
          });
        }
      }),
      catchError((error) => {
        this.logger.error(`Operation failed after ${maxRetries} retries: ${error.message}`);
        throw error;
      })
    );
  }

  // Implement other methods here...
}
