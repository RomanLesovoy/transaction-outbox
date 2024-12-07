import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { KafkaService } from '../src/kafka.service';
import { DataSource } from 'typeorm';

jest.setTimeout(10000);

describe('Order Integration Tests', () => {
  let app: INestApplication;
  let kafkaService: KafkaService;
  let dataSource: DataSource;

  const mockKafkaService = {
    emit: jest.fn().mockResolvedValue(true),
    connect: jest.fn().mockResolvedValue(undefined),
    isConnected: jest.fn().mockResolvedValue(true),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(KafkaService)
      .useValue(mockKafkaService)
      .compile();

    app = moduleFixture.createNestApplication();
    dataSource = moduleFixture.get<DataSource>(DataSource);
    kafkaService = moduleFixture.get<KafkaService>(KafkaService);
    
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /orders', () => {
    it('should create order and emit message to Kafka', async () => {
      // Генерируем уникальный ID для тестового пользователя
      const testUserId = `test-user-${Date.now()}`;
      
      const orderData = {
        amount: 100,
        user_id: testUserId,
      };

      // Создаем заказ
      const response = await request(app.getHttpServer())
        .post('/orders')
        .send(orderData)
        .expect(201);

      // Проверяем ответ API
      expect(response.body).toMatchObject({
        amount: orderData.amount,
        user_id: orderData.user_id,
        status: 'PENDING',
      });

      // Ждем некоторое время для обработки сообщения
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Проверяем, что KafkaService.emit был вызван с правильными параметрами
      expect(mockKafkaService.emit).toHaveBeenCalledWith(
        'BALANCE_CHECK',
        expect.objectContaining({
          id: response.body.id,
          amount: orderData.amount,
          user_id: orderData.user_id,
        })
      );
    });

    it('should handle Kafka emission failure', async () => {
      mockKafkaService.emit.mockRejectedValueOnce(new Error('Kafka error'));

      const orderData = {
        amount: 100,
        user_id: `test-user-${Date.now()}`,
      };

      // Заказ должен создаться даже при ошибке Kafka
      const response = await request(app.getHttpServer())
        .post('/orders')
        .send(orderData)
        .expect(201);

      expect(response.body.status).toBe('PENDING');
    });
  });
});