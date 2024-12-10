import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Delivery } from './entities/delivery.entity';
import { OutboxMessage } from './entities/outbox-message.entity';
import * as dotenv from 'dotenv';
dotenv.config();

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [Delivery, OutboxMessage],
  // synchronize: true, // only for development
  logging: false,
  logger: 'advanced-console',
};
