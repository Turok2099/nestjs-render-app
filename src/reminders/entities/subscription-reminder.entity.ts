import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Subscription } from '../../subscriptions/entities/subscription.entity';

@Entity('subscription_reminders')
export class SubscriptionReminder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // FK explícita para dedupe y consultas rápidas
  @Index()
  @Column('uuid')
  subscriptionId: string;

  // Relación (opcional usarla en joins)
  @ManyToOne(() => Subscription, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'subscriptionId' })
  subscription: Subscription;

  // Tipo libre (no enum rígido): p.ej. 'expiry_7d', 'benefits_nudge'
  @Index()
  @Column({ type: 'varchar', length: 64 })
  type: string;

  @CreateDateColumn()
  createdAt: Date;
}
