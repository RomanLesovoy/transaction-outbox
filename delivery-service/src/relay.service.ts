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
    return this.dataSource.transaction(async (manager) => {
      const messages = await manager
        .createQueryBuilder(OutboxMessage, 'outbox')
        .setLock('pessimistic_write')
        .where('outbox.published = :published', { published: false })
        .andWhere('outbox.retry_count < :maxRetries', { maxRetries: 3 })
        .take(10)
        .getMany();

      this.logger.debug(`Processing ${messages.length} messages`);
      
      for (const message of messages) {
        try {
          await this.kafkaService.emit(message.type, {
            id: message.aggregate_id,
            ...message.payload,
          });
          
          message.published = true;
          message.published_at = new Date();
          this.logger.debug(`Successfully processed message ${message.id}`);
        } catch (error) {
          message.retry_count += 1;
          message.last_error = error.message;
          this.logger.error(`Failed to process message ${message.id}: ${error.message}`);
        }
      }

      return manager.save(messages);
    });
  }
}

