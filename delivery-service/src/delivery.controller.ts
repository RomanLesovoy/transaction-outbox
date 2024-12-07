import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { DeliveryService } from './delivery.service';

@Controller()
export class DeliveryController {
  private readonly logger = new Logger(DeliveryController.name);

  constructor(private readonly deliveryService: DeliveryService) {}

  @MessagePattern('DELIVERY_INIT')
  async initDelivery(@Payload() data: any) {
    this.logger.log(`Received DELIVERY_INIT event: ${JSON.stringify(data)}`);
    return this.deliveryService.initDelivery(data);
  }
}
