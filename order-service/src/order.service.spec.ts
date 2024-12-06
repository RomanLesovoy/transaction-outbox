import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './order.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OutboxMessage } from './entities/outbox-message.entity';
import { Repository, DataSource, QueryRunner, EntityManager } from 'typeorm';

describe('OrdersService', () => {
  let service: OrdersService;
  let orderRepository: Repository<Order>;
  let outboxRepository: Repository<OutboxMessage>;
  let dataSource: DataSource;
  let queryRunner: QueryRunner;
  let entityManager: EntityManager;

  beforeEach(async () => {
    // Создаем mock для EntityManager
    entityManager = {
      create: jest.fn(),
      save: jest.fn(),
    } as unknown as EntityManager;

    // Создаем mock для QueryRunner
    queryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: entityManager,
    } as unknown as QueryRunner;

    // Создаем mock для DataSource
    const dataSourceMock = {
      createQueryRunner: jest.fn().mockReturnValue(queryRunner),
    } as unknown as DataSource;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getRepositoryToken(Order),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(OutboxMessage),
          useClass: Repository,
        },
        {
          provide: DataSource,
          useValue: dataSourceMock,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    orderRepository = module.get<Repository<Order>>(getRepositoryToken(Order));
    outboxRepository = module.get<Repository<OutboxMessage>>(getRepositoryToken(OutboxMessage));
    dataSource = module.get<DataSource>(DataSource);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create an order', async () => {
    // Подготовка тестовых данных
    const createOrderDto = { amount: 100, userId: 'user123' };
    const createdOrder = {
      id: 'test-uuid',
      ...createOrderDto,
      status: 'PENDING',
    };
    const savedOrder = {
      ...createdOrder,
      createdAt: new Date(),
    };

    // Mock для создания и сохранения заказа
    jest.spyOn(entityManager, 'create')
      .mockReturnValueOnce(createdOrder as any) // для заказа
      .mockReturnValueOnce({} as any); // для outbox сообщения

    jest.spyOn(entityManager, 'save')
      .mockResolvedValueOnce(savedOrder) // для заказа
      .mockResolvedValueOnce({}); // для outbox сообщения

    // Выполнение теста
    const result = await service.createOrder(createOrderDto);

    // Проверки
    expect(queryRunner.connect).toHaveBeenCalled();
    expect(queryRunner.startTransaction).toHaveBeenCalled();
    expect(entityManager.create).toHaveBeenCalledTimes(2);
    expect(entityManager.save).toHaveBeenCalledTimes(2);
    expect(queryRunner.commitTransaction).toHaveBeenCalled();
    expect(queryRunner.release).toHaveBeenCalled();
    expect(result).toEqual(savedOrder);
  });

  it('should rollback transaction on error', async () => {
    // Подготовка тестовых данных
    const createOrderDto = { amount: 100, userId: 'user123' };
    
    // Mock для имитации ошибки
    jest.spyOn(entityManager, 'create').mockReturnValue({} as any);
    jest.spyOn(entityManager, 'save').mockRejectedValue(new Error('Test error'));

    // Выполнение теста и проверка на ошибку
    await expect(service.createOrder(createOrderDto)).rejects.toThrow('Failed to create order: Test error');

    // Проверки
    expect(queryRunner.connect).toHaveBeenCalled();
    expect(queryRunner.startTransaction).toHaveBeenCalled();
    expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
    expect(queryRunner.release).toHaveBeenCalled();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});