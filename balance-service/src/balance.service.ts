import { Injectable } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Balance } from './entities/balance.entity';
import { OutboxMessage } from './entities/outbox-message.entity';

@Injectable()
export class BalanceService {
  constructor(
    @InjectRepository(Balance)
    private balanceRepository: Repository<Balance>,
    @InjectRepository(OutboxMessage)
    private outboxRepository: Repository<OutboxMessage>,
    private dataSource: DataSource,
  ) {}

  @MessagePattern('BALANCE_CHECK')
  async processBalanceCheck(data: any) {
    return this.dataSource.transaction(async (manager) => {
      // Check and update balance
      const newBalance = await this.updateBalance(data.order_id, data.amount);
      const balance = await this.getBalance(data.order_id);
      
      // Create message for delivery service
      const outboxMessage = manager.create(OutboxMessage, {
        aggregate_type: 'BALANCE',
        aggregate_id: data.order_id,
        type: 'DELIVERY_INIT',
        payload: { order_id: data.order_id },
      });

      await manager.save(OutboxMessage, outboxMessage);

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
