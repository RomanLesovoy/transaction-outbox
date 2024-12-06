import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { KafkaService } from './kafka.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private readonly kafkaService: KafkaService) {}

  @Get('health')
  async health() {
    return {
      status: 'ok',
      kafka: await this.kafkaService.isConnected(),
    };
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
