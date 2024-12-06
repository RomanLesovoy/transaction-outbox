import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { MessagePattern } from '@nestjs/microservices';
import { Delivery } from './entities/delivery.entity';
import { OutboxMessage } from './/entities/outbox-message.entity';

@Injectable()
export class DeliveryService {
  constructor(
    @InjectRepository(Delivery)
    private deliveryRepository: Repository<Delivery>,
    @InjectRepository(OutboxMessage)
    private outboxRepository: Repository<OutboxMessage>,
    private dataSource: DataSource,
  ) {}

  @MessagePattern('DELIVERY_INIT')
  async initDelivery(data: any) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create delivery record
      const delivery = await queryRunner.manager.create(Delivery, {
        orderId: data.orderId,
        status: 'INITIATED',
      });

      const savedDelivery = await queryRunner.manager.save(Delivery, delivery);

      // Create final message about completion
      const outboxMessage = await queryRunner.manager.create(OutboxMessage, {
        aggregateType: 'DELIVERY',
        aggregateId: data.orderId,
        type: 'ORDER_COMPLETED',
        payload: { orderId: data.orderId },
      });

      await queryRunner.manager.save(OutboxMessage, outboxMessage);

      await queryRunner.commitTransaction();
      return delivery;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
