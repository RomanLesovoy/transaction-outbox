import { Entity, Column, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Balance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  user_id: string;

  @Column('decimal')
  amount: number;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
