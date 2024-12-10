import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Delivery } from './entities/delivery.entity';
import { OutboxMessage } from './/entities/outbox-message.entity';

@Injectable()
export class DeliveryService {
  private readonly logger = new Logger(DeliveryService.name);

  constructor(
    private dataSource: DataSource,
  ) {}

  async initDelivery(data: any) {
    return this.dataSource.transaction(async (manager) => {
      // Create delivery record
      const delivery = manager.create(Delivery, {
        order_id: data.order_id,
        status: 'INITIATED',
      });

      const savedDelivery = await manager.save(Delivery, delivery);

      // Create final message about completion
      const outboxMessage = manager.create(OutboxMessage, {
        aggregate_type: 'DELIVERY',
        aggregate_id: data.order_id,
        type: 'ORDER_COMPLETED',
        payload: { order_id: data.order_id },
      });

      await manager.save(OutboxMessage, outboxMessage);

      this.logger.log(`Transaction completed`);

      return savedDelivery;
    });
  }
}
