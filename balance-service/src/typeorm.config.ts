import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Balance } from './entities/balance.entity';
import { OutboxMessage } from './entities/outbox-message.entity';
import { configDotenv } from 'dotenv';
const config: any = configDotenv();

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: config.DB_HOST,
  port: parseInt(config.DB_PORT),
  username: config.DB_USERNAME,
  password: config.DB_PASSWORD,
  database: config.DB_DATABASE,
  entities: [Balance, OutboxMessage],
  // synchronize: true, // only for development
  logging: true,
  logger: 'advanced-console',
};
