import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { RelayService } from './relay.service';
import { KafkaModule } from './kafka.module';

@Module({
  imports: [ScheduleModule.forRoot(), KafkaModule],
  providers: [RelayService],
  exports: [RelayService],
})
export class RelayModule {}