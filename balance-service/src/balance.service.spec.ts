import { Test, TestingModule } from '@nestjs/testing';
import { BalanceService } from './balance.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Balance } from './entities/balance.entity';
import { OutboxMessage } from './entities/outbox-message.entity';
import { Repository } from 'typeorm';

describe('BalanceService', () => {
  let service: BalanceService;
  let balanceRepository: Repository<Balance>;
  let outboxRepository: Repository<OutboxMessage>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BalanceService,
        {
          provide: getRepositoryToken(Balance),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(OutboxMessage),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<BalanceService>(BalanceService);
    balanceRepository = module.get<Repository<Balance>>(getRepositoryToken(Balance));
    outboxRepository = module.get<Repository<OutboxMessage>>(getRepositoryToken(OutboxMessage));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Add more tests specific to BalanceService
});