import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order } from './entities/order.entity';
import { OutboxMessage } from './entities/outbox-message.entity';
import { CreateOrderDto } from './entities/create-order';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);
  constructor(
    @InjectRepository(Order) private orderRepository: Repository<Order>,
    private dataSource: DataSource,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto) {
    this.logger.log('try createQueryRunner')
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    this.logger.log('Connected to database');
    await queryRunner.startTransaction();

    try {
      // Create order
      const order = queryRunner.manager.create(Order, {
        amount: createOrderDto.amount,
        userId: createOrderDto.userId,
        status: 'PENDING',
      });

      const savedOrder = await queryRunner.manager.save(Order, order);

      // Create outbox messages
      const outboxMessage = queryRunner.manager.create(OutboxMessage, {
        aggregateType: 'ORDER',
        aggregateId: savedOrder.id,
        type: 'BALANCE_CHECK',
        payload: { 
          orderId: savedOrder.id, 
          amount: savedOrder.amount,
          userId: savedOrder.userId,
        },
      });

      await queryRunner.manager.save(OutboxMessage, outboxMessage);

      await queryRunner.commitTransaction();
      return savedOrder;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      if (err.code === '23505') { // Unique key error
        throw new Error('Order with this ID already exists');
      }
      throw new Error(`Failed to create order: ${err.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  async findOne(id: string) {
    return this.orderRepository.findOne({ where: { id } });
  }

  async updateOrderStatus(orderId: string, status: string): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = await queryRunner.manager.findOne(Order, { 
        where: { id: orderId } 
      });
      
      if (!order) {
        throw new Error('Order not found');
      }

      order.status = status;
      await queryRunner.manager.save(order);

      await queryRunner.commitTransaction();
      return order;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
