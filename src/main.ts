import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { VersioningType, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import helmet from 'helmet';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

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
  app.useGlobalFilters(new HttpExceptionFilter(
    app.get('AuditLoggingService'),
    app.get('EventEmitterService')
  ));

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
