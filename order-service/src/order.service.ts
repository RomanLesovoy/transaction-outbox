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
    return this.dataSource.transaction(async (manager) => {
      // Create order
      const order = manager.create(Order, {
        amount: createOrderDto.amount,
        user_id: createOrderDto.user_id,
        status: 'PENDING',
      });
      
      const savedOrder = await manager.save(Order, order);

      // Create outbox message
      const outboxMessage = manager.create(OutboxMessage, {
        aggregate_type: 'ORDER',
        aggregate_id: savedOrder.id,
        type: 'BALANCE_CHECK',
        payload: { 
          order_id: savedOrder.id, 
          amount: savedOrder.amount,
          user_id: savedOrder.user_id,
        },
      });

      await manager.save(OutboxMessage, outboxMessage);
      
      this.logger.log(`Transaction completed`);
      return savedOrder;
    });
  }

  async findOne(id: string) {
    return this.orderRepository.findOne({ where: { id } });
  }

  async updateOrderStatus(orderId: string, status: string): Promise<Order> {
    return this.dataSource.transaction(async (manager) => {
      const order = await manager.findOne(Order, { 
        where: { id: orderId } 
      });
      
      if (!order) {
        throw new Error('Order not found');
      }
  
      order.status = status;
      return manager.save(order);
    });
  }
}
