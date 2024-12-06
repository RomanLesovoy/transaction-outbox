import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class OutboxMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  aggregateType: string;

  @Column()
  aggregateId: string;

  @Column()
  type: string;

  @Column('jsonb')
  payload: any;

  @Column({ default: false })
  published: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: 0 })
  retryCount: number;

  @Column({ nullable: true })
  publishedAt: Date;

  @Column({ nullable: true })
  lastError: string;
}
