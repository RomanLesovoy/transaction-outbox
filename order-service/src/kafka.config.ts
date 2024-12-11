import { KafkaOptions, Transport } from "@nestjs/microservices";
import { Partitioners } from 'kafkajs';
import * as dotenv from 'dotenv';
dotenv.config();

export const kafkaConfig: KafkaOptions = {
  transport: Transport.KAFKA,
  options: {
    client: {
      clientId: process.env.KAFKA_CLIENT_ID || 'order-service',
      brokers: ['kafka:9092', 'kafka:29092'],
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
