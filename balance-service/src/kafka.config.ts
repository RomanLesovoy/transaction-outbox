import { KafkaOptions, Transport } from '@nestjs/microservices';
import { Partitioners } from 'kafkajs';

import * as dotenv from 'dotenv';
dotenv.config();

const isLocal = process.env.NODE_ENV !== 'production';

export const kafkaConfig: KafkaOptions = {
  transport: Transport.KAFKA,
  options: {
    client: {
      clientId: process.env.KAFKA_CLIENT_ID || 'balance-service',
      brokers: [(isLocal ? 'localhost:9092' : process.env.KAFKA_BROKERS) || 'localhost:9092'],
      retry: {
        initialRetryTime: 1000,
        retries: 8,
        maxRetryTime: 30000,
      },
      connectionTimeout: 45000,
    },
    consumer: {
      groupId: process.env.KAFKA_GROUP_ID || 'service-consumer-group',
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
