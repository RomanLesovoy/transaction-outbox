import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class Delivery {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_id' })
  order_id: string;

  @Column()
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}