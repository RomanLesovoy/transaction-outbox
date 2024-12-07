import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DeliveryService } from './delivery.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './typeorm.config';
import { KafkaModule } from './kafka.module';
import { RelayModule } from './relay.module';
import { DeliveryController } from './delivery.controller';

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig),
    KafkaModule,
    RelayModule,
  ],
  controllers: [AppController, DeliveryController],
  providers: [AppService, DeliveryService],
})
export class AppModule {}
