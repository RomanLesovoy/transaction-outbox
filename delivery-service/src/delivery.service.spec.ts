import { Test, TestingModule } from '@nestjs/testing';
import { DeliveryService } from './delivery.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Delivery } from './entities/delivery.entity';
import { OutboxMessage } from './entities/outbox-message.entity';
import { Repository } from 'typeorm';

describe('DeliveryService', () => {
  let service: DeliveryService;
  let deliveryRepository: Repository<Delivery>;
  let outboxRepository: Repository<OutboxMessage>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeliveryService,
        {
          provide: getRepositoryToken(Delivery),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(OutboxMessage),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<DeliveryService>(DeliveryService);
    deliveryRepository = module.get<Repository<Delivery>>(getRepositoryToken(Delivery));
    outboxRepository = module.get<Repository<OutboxMessage>>(getRepositoryToken(OutboxMessage));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Add more tests specific to DeliveryService
})