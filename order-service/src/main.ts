import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { kafkaConfig } from './kafka.config';
import { Logger } from '@nestjs/common';
import * as dotenv from 'dotenv';
dotenv.config();

async function bootstrap() {
  const logger = new Logger('Bootstrap Order Service');
  
  try {
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'debug', 'log', 'verbose'],
    });

    app.connectMicroservice(kafkaConfig, { inheritAppConfig: true });
    await app.startAllMicroservices();
    
    const port = process.env.PORT || 3000;
    await app.listen(port, '0.0.0.0', () => {
      logger.log(`Application is running on: http://0.0.0.0:${port}`);
    });
  } catch (error) {
    logger.error('Failed to start order service:', error);
    throw error;
  }
}

bootstrap().catch((error) => {
  console.error('Failed to start order service:', error);
  process.exit(1);
});
