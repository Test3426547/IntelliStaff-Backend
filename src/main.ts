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
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import * as csurf from 'csurf';
import * as hpp from 'hpp';
import { CommonUtils } from './common/common-utils';

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

  // Use Helmet for security headers with CSP
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://api.example.com"], // Add your API domains
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    referrerPolicy: {
      policy: 'strict-origin-when-cross-origin',
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  }));

  // Set additional security headers
  app.use((req, res, next) => {
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    next();
  });

  // Use compression for responses
  app.use(compression());

  // Use cookie parser
  app.use(cookieParser());

  // Enable CORS with enhanced security options
  app.enableCors({
    origin: configService.get('ALLOWED_ORIGINS').split(','),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['X-Total-Count'],
    credentials: true,
    maxAge: 3600,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Apply rate limiting globally with a more robust strategy
  app.use(
    ThrottlerModule.forRootAsync({
      imports: [AppModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        ttl: config.get('THROTTLE_TTL', 60),
        limit: config.get('THROTTLE_LIMIT', 100),
      }),
    }),
  );
  app.useGlobalGuards(app.get(ThrottlerGuard));

  // Enable CSRF protection
  app.use(csurf());

  // Enable HTTP Parameter Pollution protection
  app.use(hpp());

  // Swagger setup with authentication
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
      persistAuthorization: true,
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

  // Global error handling
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Send to error monitoring service
    sentryService.captureException(reason);
  });

  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    // Send to error monitoring service
    sentryService.captureException(error);
    // Gracefully shutdown the server
    app.close().then(() => process.exit(1));
  });

  // Start the application
  const port = configService.get('PORT') || 3000;
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

CommonUtils.retryOperation(bootstrap, 3, 5000)
  .catch((error) => {
    console.error('Failed to start the application:', error);
    process.exit(1);
  });
