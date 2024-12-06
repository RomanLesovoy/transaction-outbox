import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrdersService } from './order.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KafkaModule } from './kafka.module';
import { OrdersController } from './orders.controller';
import { databaseConfig } from './typeorm.config';
import { Order } from './entities/order.entity';
import { OutboxMessage } from './entities/outbox-message.entity';
import { RelayModule } from './relay.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forFeature([Order, OutboxMessage]),
    TypeOrmModule.forRoot(databaseConfig),
    KafkaModule,
    RelayModule,
  ],
  controllers: [AppController, OrdersController],
  providers: [AppService, OrdersService],
})
export class AppModule {}
