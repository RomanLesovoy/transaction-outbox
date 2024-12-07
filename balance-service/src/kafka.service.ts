import { Injectable, Inject, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class KafkaService {
  private readonly logger = new Logger(KafkaService.name);
  private isInitialized = false;
  private connectionRetries = 0;
  private readonly MAX_RETRIES = 5;

  constructor(
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {}

  // async isConnected() {
  //   try {
  //     if (!this.isInitialized) {
  //       await this.kafkaClient.connect();
  //       this.isInitialized = true;
  //     }
  //     this.logger.log('Kafka connection successful');
  //     return true;
  //   } catch (error) {
  //     this.logger.error('Kafka connection failed:', error);
  //     return false;
  //   }
  // }

  // async onModuleInit() {
  //   const topics = []; // TODO: add topics if used send() (request-response pattern)
    
  //   topics.forEach(topic => {
  //     this.kafkaClient.subscribeToResponseOf(topic);
  //     this.logger.log(`Subscribed to topic: ${topic}`);
  //   });

  //   await this.tryConnect();
  // }

  private async tryConnect() {
    while (this.connectionRetries < this.MAX_RETRIES) {
      try {
        await this.kafkaClient.connect();
        this.logger.log('Successfully connected to Kafka');
        this.isInitialized = true;
        return;
      } catch (error) {
        this.connectionRetries++;
        this.logger.warn(
          `Failed to connect to Kafka. Attempt ${this.connectionRetries}/${this.MAX_RETRIES}. Retrying in 5 seconds...`
        );
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
    this.logger.error('Failed to connect to Kafka after maximum retries');
  }

  async emit(topic: string, message: any) {
    if (!this.isInitialized) {
      this.logger.warn('Kafka client not initialized, attempting to connect...');
      await this.tryConnect();
    }

    this.logger.debug(`Emitting message to topic ${topic}: ${JSON.stringify(message)}`);
    try {
      return await firstValueFrom(this.kafkaClient.emit(topic, {
        key: message.id,
        value: message,
        timestamp: Date.now(),
      }));
    } catch (error) {
      this.logger.error(`Failed to emit message to topic ${topic}:`, error);
      throw error;
    }
  }

  // async send(topic: string, message: any) {
  //   if (!this.isInitialized) {
  //     this.logger.warn('Kafka client not initialized, attempting to connect...');
  //     await this.tryConnect();
  //   }

  //   try {
  //     return await firstValueFrom(this.kafkaClient.send(topic, {
  //       key: message.id,
  //       value: message,
  //       timestamp: Date.now(),
  //     }));
  //   } catch (error) {
  //     this.logger.error(`Failed to send message to topic ${topic}:`, error);
  //     throw error;
  //   }
  // }
}
