import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { OutboxMessage } from './entities/outbox-message.entity';

@Injectable()
export class BalanceService {
  private readonly logger = new Logger(BalanceService.name);

  constructor(
    private dataSource: DataSource,
  ) {}

  async processBalanceCheck(data: any) {
    return this.dataSource.transaction(async (manager) => {
      // Check and update balance
      await this.updateBalance(data.order_id, data.amount);
      const balance = await this.getBalance(data.order_id);
      
      // Create message for delivery service
      const outboxMessage = manager.create(OutboxMessage, {
        aggregate_type: 'BALANCE',
        aggregate_id: data.order_id,
        type: 'DELIVERY_INIT',
        payload: { order_id: data.order_id },
      });

      await manager.save(OutboxMessage, outboxMessage);

      this.logger.log(`Transaction completed`);

      return balance;
    });
  }

  async getBalance(order_id: string) {
    // Implement balance check logic here

    return { balance: 100 }; // Example return value
  }

  async updateBalance(order_id: string, amount: number) {
    // Implement balance update logic here
  }
}
