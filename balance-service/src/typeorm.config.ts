import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Balance } from './entities/balance.entity';
import { OutboxMessage } from './entities/outbox-message.entity';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [Balance, OutboxMessage],
  synchronize: true, // only for development
  logging: true,
  logger: 'advanced-console',
};
