import { 
  Controller, 
  Post, 
  Body, 
  Get,
  Param,
  HttpException,
  HttpStatus,
  ValidationPipe,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { OrdersService } from './order.service';
import { CreateOrderDto } from './entities/create-order';
import { MessagePattern } from '@nestjs/microservices';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  private readonly logger = new Logger(OrdersController.name);

  constructor(
    private readonly ordersService: OrdersService, 
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create new order' })
  @ApiResponse({ 
    status: 201, 
    description: 'Order created successfully',
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid request data',
  })
  async createOrder(
    @Body(new ValidationPipe({ transform: true })) 
    createOrderDto: CreateOrderDto,
  ) {
    try {
      this.logger.log(`Creating order: ${JSON.stringify(createOrderDto)}`);
      
      const order = await this.ordersService.createOrder(createOrderDto);
      
      this.logger.log(`Order created successfully: ${order.id}`);
      
      return {
        id: order.id,
        amount: order.amount,
        status: order.status,
        user_id: order.user_id,
        created_at: order.created_at,
      };
    } catch (error) {
      this.logger.error(`Failed to create order: ${error.message}`, error.stack);
      
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Failed to create order',
          details: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Order found',
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Order not found',
  })
  async getOrder(@Param('id') id: string) {
    const order = await this.ordersService.findOne(id);
    if (!order) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'Order not found',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return order;
  }

  @MessagePattern('ORDER_COMPLETED')
  async handleOrderCompleted(data: any) {
    try {
      await this.ordersService.updateOrderStatus(data.order_id, 'COMPLETED');
      this.logger.log(`Order completed: ${JSON.stringify(data)}`);
    } catch (error) {
      this.logger.error(`Failed to handle order completed: ${error.message}`, error.stack);
    }
  }
}
