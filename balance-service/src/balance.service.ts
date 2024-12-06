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
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Check and update balance
      const newBalance = await this.updateBalance(data.orderId, data.amount);
      const balance = await this.getBalance(data.orderId);
      
      // Create message for delivery service
      const outboxMessage = await queryRunner.manager.create(OutboxMessage, {
        aggregateType: 'BALANCE',
        aggregateId: data.orderId,
        type: 'DELIVERY_INIT',
        payload: { orderId: data.orderId },
      });

      const savedOutboxMessage = await queryRunner.manager.save(OutboxMessage, outboxMessage);

      await queryRunner.commitTransaction();
      return balance;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getBalance(orderId: string) {
    // Implement balance check logic here

    return { balance: 100 }; // Example return value
  }

  async updateBalance(orderId: string, amount: number) {
    // Implement balance update logic here
  }
}
