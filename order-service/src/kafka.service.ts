import { Injectable, Inject, OnModuleInit, Logger } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class KafkaService implements OnModuleInit {
  private readonly logger = new Logger(KafkaService.name);

  constructor(
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {}

  async isConnected() {
    try {
      await this.kafkaClient.connect();
      this.logger.log('Kafka connection successful');
      return true;
    } catch (error) {
      this.logger.error('Kafka connection failed:', error);
      return false;
    }
  }

  async onModuleInit() {
    // Check if the topics are defined in the environment variables
    const topics = ['ORDER_CREATED', 'BALANCE_CHECKED', 'DELIVERY_INITIATED'];
    
    // Subscribe to the topics
    topics.forEach(topic => {
      this.kafkaClient.subscribeToResponseOf(topic);
      this.logger.log(`Subscribed to topic: ${topic}`);
    });

    await this.kafkaClient.connect();
  }

  async emit(topic: string, message: any) {
    this.logger.debug(`Emitting message to topic ${topic}: ${JSON.stringify(message)}`);
    try {
      return await this.kafkaClient.emit(topic, {
        key: message.id,
        value: message,
        timestamp: Date.now(),
      }).toPromise();
    } catch (error) {
      console.error(`Failed to emit message to topic ${topic}:`, error);
      throw error;
    }
  }

  async send(topic: string, message: any) {
    try {
      return await this.kafkaClient.send(topic, {
        key: message.id,
        value: message,
        timestamp: Date.now(),
      }).toPromise();
    } catch (error) {
      console.error(`Failed to send message to topic ${topic}:`, error);
      throw error;
    }
  }
}
