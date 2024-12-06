import { KafkaOptions, Transport } from '@nestjs/microservices';
import { Partitioners } from 'kafkajs';

export const kafkaConfig: KafkaOptions = {
  transport: Transport.KAFKA,
  options: {
    client: {
      clientId: process.env.SERVICE_NAME || 'balance-service',
      brokers: [process.env.KAFKA_BROKERS || 'kafka:29092'],
      retry: {
        initialRetryTime: 1000,
        retries: 8,
        maxRetryTime: 30000,
      },
      connectionTimeout: 45000,
    },
    consumer: {
      groupId: process.env.KAFKA_GROUP_ID || 'balance-consumer-group',
      allowAutoTopicCreation: true,
      sessionTimeout: 45000,
      heartbeatInterval: 15000,
      maxWaitTimeInMs: 5000,
      retry: {
        initialRetryTime: 1000,
        retries: 8,
      },
    },
    producer: {
      allowAutoTopicCreation: true,
      createPartitioner: Partitioners.LegacyPartitioner,
      idempotent: true,
      retry: {
        initialRetryTime: 1000,
        retries: 8,
      },
    },
  },
};