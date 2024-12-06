import { KafkaOptions } from "@nestjs/microservices";
import { Transport } from "@nestjs/microservices";
import { Partitioners } from 'kafkajs';

export const kafkaConfig: KafkaOptions = {
  transport: Transport.KAFKA,
  options: {
    client: {
      clientId: process.env.SERVICE_NAME || 'order-service',
      brokers: [process.env.KAFKA_BROKERS || 'kafka:9092'],
      retry: {
        initialRetryTime: 1000,
        retries: 8,
        maxRetryTime: 30000,
      },
      connectionTimeout: 45000,
    },
    consumer: {
      groupId: process.env.KAFKA_GROUP_ID || 'order-group',
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
