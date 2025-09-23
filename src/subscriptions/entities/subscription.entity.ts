import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

export type SubscriptionStatus = 'active' | 'cancelled' | 'expired';

@Entity({ name: 'subscriptions' })
@Index(['userId', 'status', 'endAt'])
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { eager: false, nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'plan_id', type: 'uuid', nullable: true })
  planId: string | null;

  @Column({ name: 'start_at', type: 'timestamptz' })
  startAt: Date;

  @Column({ name: 'end_at', type: 'timestamptz' })
  endAt: Date;

  @Column({ type: 'varchar', length: 10, default: 'active' })
  status: SubscriptionStatus;

  @CreateDateColumn({ name: 'created_at' }) 
  createdAt: Date;
  
  @UpdateDateColumn({ name: 'updated_at' }) 
  updatedAt: Date;
}