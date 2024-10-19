import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { VersioningType, ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import helmet from 'helmet';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { AuditLoggingService } from './audit-logging/audit-logging.service';
import { LoggingMiddleware } from './common/middleware/logging.middleware';
import { SentryService } from './common/services/sentry.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const auditLoggingService = app.get(AuditLoggingService);
  const sentryService = app.get(SentryService);

  // Initialize Sentry
  sentryService.initialize();

  // Apply LoggingMiddleware
  app.use(new LoggingMiddleware().use);

  // Enable API versioning
  app.enableVersioning({
    type: VersioningType.URI,
  });

  // Apply global pipes
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Apply global filters
  app.useGlobalFilters(new GlobalExceptionFilter(auditLoggingService, sentryService));

  // Use Helmet for security headers
  app.use(helmet());

  // Use compression for responses
  app.use(compression());

  // Use cookie parser
  app.use(cookieParser());

  // Enable CORS with specific options
  app.enableCors({
    origin: configService.get('ALLOWED_ORIGINS'),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('AI Recruitment Platform API')
    .setDescription('The API for the AI-powered recruitment platform')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Add version information to Swagger UI
  const options = {
    swaggerOptions: {
      urls: [
        {
          url: '/api-json',
          name: 'v1',
        },
        {
          url: '/api-json-v2',
          name: 'v2',
        },
      ],
    },
  };

  SwaggerModule.setup('api', app, document, options);

  // Set global prefix
  app.setGlobalPrefix('api');

  // Start the application
  await app.listen(configService.get('PORT') || 3000);
}
bootstrap();
