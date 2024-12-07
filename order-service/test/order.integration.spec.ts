import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { KafkaService } from '../src/kafka.service';
import { DataSource } from 'typeorm';
import { RelayService } from '../src/relay.service';
import { OutboxMessage } from '../src/entities/outbox-message.entity';

jest.setTimeout(10000);

describe('Order Integration Tests', () => {
  let app: INestApplication;
  let kafkaService: KafkaService;
  let dataSource: DataSource;
  let relayService: RelayService;

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
    relayService = moduleFixture.get<RelayService>(RelayService);
    
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /orders', () => {
    it('should create order and emit message to Kafka', async () => {
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

      // Проверяем создание сообщения в outbox
      const outboxMessage = await dataSource
        .getRepository(OutboxMessage)
        .findOne({
          where: { 
            aggregate_id: response.body.id,
            type: 'BALANCE_CHECK'
          }
        });

      expect(outboxMessage).toBeDefined();
      expect(outboxMessage.payload).toMatchObject({
        order_id: response.body.id,
        amount: orderData.amount,
        user_id: orderData.user_id,
      });

      // Явно вызываем обработку сообщений
      await relayService.processOutboxMessages();

      // Проверяем, что KafkaService.emit был вызван с правильными параметрами
      expect(mockKafkaService.emit).toHaveBeenCalledWith(
        'BALANCE_CHECK',
        expect.objectContaining({
          id: response.body.id,
          ...outboxMessage.payload,
        })
      );

      // Проверяем, что сообщение помечено как отправленное
      const updatedOutboxMessage = await dataSource
        .getRepository(OutboxMessage)
        .findOne({
          where: { id: outboxMessage.id }
        });

      expect(updatedOutboxMessage.published).toBe(true);
      expect(updatedOutboxMessage.published_at).toBeDefined();
    });

    it('should handle Kafka emission failure', async () => {
      mockKafkaService.emit.mockRejectedValueOnce(new Error('Kafka error'));

      const orderData = {
        amount: 100,
        user_id: `test-user-${Date.now()}`,
      };

      const response = await request(app.getHttpServer())
        .post('/orders')
        .send(orderData)
        .expect(201);

      expect(response.body.status).toBe('PENDING');

      // Проверяем создание сообщения в outbox
      const outboxMessage = await dataSource
        .getRepository(OutboxMessage)
        .findOne({
          where: { 
            aggregate_id: response.body.id,
            type: 'BALANCE_CHECK'
          }
        });

      expect(outboxMessage).toBeDefined();

      // Явно вызываем обработку сообщений
      await relayService.processOutboxMessages();

      // Проверяем, что сообщение помечено для повторной попытки
      const updatedOutboxMessage = await dataSource
        .getRepository(OutboxMessage)
        .findOne({
          where: { id: outboxMessage.id }
        });

      expect(updatedOutboxMessage.published).toBe(false);
      expect(updatedOutboxMessage.retry_count).toBe(1);
      expect(updatedOutboxMessage.last_error).toBe('Kafka error');
    });
  });
});
