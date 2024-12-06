import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
import { kafkaConfig } from './kafka.config';
import { Logger } from '@nestjs/common';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);
  
//   app.connectMicroservice({
//     transport: Transport.KAFKA,
//     options: {
//       client: {
//         brokers: ['localhost:9092'],
//         clientId: 'order-service',
//       },
//       consumer: {
//         groupId: 'order-consumer-group',
//       },
//     },
//   });

//   await app.startAllMicroservices();
//   await app.listen(process.env.PORT_ORDER_SERVICE ?? 3000);
// }
// bootstrap();

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  try {
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'debug', 'log', 'verbose'],
    });

    app.connectMicroservice(kafkaConfig);

    await app.startAllMicroservices();
    
    const port = process.env.PORT || 3000;
    await app.listen(port, '0.0.0.0', () => {
      logger.log(`Application is running on: http://0.0.0.0:${port}`);
    });
  } catch (error) {
    logger.error('Failed to start application:', error);
    throw error;
  }
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});