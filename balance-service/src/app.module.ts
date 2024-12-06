import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BalanceService } from './balance.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './typeorm.config';
import { KafkaModule } from './kafka.module';
import { RelayModule } from './relay.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig),
    KafkaModule,
    RelayModule,
  ],
  controllers: [AppController],
  providers: [AppService, BalanceService],
})
export class AppModule {}
