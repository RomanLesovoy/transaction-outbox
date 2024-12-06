import { Injectable, Logger } from '@nestjs/common';;
import { OutboxMessage } from './entities/outbox-message.entity';
import { Cron } from '@nestjs/schedule';
import { KafkaService } from './kafka.service';
import { DataSource } from 'typeorm';

@Injectable()
export class RelayService {
  private readonly logger = new Logger(RelayService.name);

  constructor(
    private readonly kafkaService: KafkaService,
    private dataSource: DataSource,
  ) {}

  @Cron('*/5 * * * * *')
  async processOutboxMessages() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      const messages = await queryRunner.manager
        .createQueryBuilder(OutboxMessage, 'outbox')
        // .setLock('pessimistic_write')
        .where('outbox.published = :published', { published: false })
        .andWhere('outbox.retryCount < :maxRetries', { maxRetries: 3 })
        .take(10)
        .getMany();

      for (const message of messages) {
        try {
          await this.kafkaService.emit(message.type, {
            id: message.aggregateId,
            ...message.payload,
          });
          
          message.published = true;
          message.publishedAt = new Date();
          this.logger.debug(`Successfully processed message ${message.id}`);
        } catch (error) {
          message.retryCount += 1;
          message.lastError = error.message;
          this.logger.error(`Failed to process message ${message.id}: ${error.message}`);
        }
      }

      await queryRunner.manager.save(messages);
    } catch (err) {
      throw err;
    }
  }
}

