import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class OutboxMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'aggregate_type' })
  aggregate_type: string;

  @Column({ name: 'aggregate_id' })
  aggregate_id: string;

  @Column()
  type: string;

  @Column('jsonb')
  payload: any;

  @Column({ default: false })
  published: boolean;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @Column({ name: 'retry_count', default: 0 })
  retry_count: number;

  @Column({ name: 'published_at', nullable: true })
  published_at: Date;

  @Column({ name: 'last_error', nullable: true })
  last_error: string;
}
