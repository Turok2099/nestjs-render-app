import { ClassHistory } from '../../classes/entities/class-history.entity';
import { Review } from '../../reviews/entities/review.entity';
import { Payment } from '../../payments/entities/payment.entity';

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

export type UserRole = 'member' | 'trainer' | 'admin';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 80 })
  name: string;

  @Index({ unique: true })
  @Column({ length: 120 })
  email: string;

  @Column({ name: 'password_hash', select: false })
  passwordHash: string;

  @Column({ type: 'varchar', length: 10, default: 'member' })
  role: UserRole;

  @Column({ type: 'boolean', default: false })
  isBlocked: boolean;

  @Column({ name: 'google_id', type: 'varchar', length: 64, nullable: true })
  googleId: string | null;

  // Datos opcionales alineados con el front
  @Column({ type: 'varchar', length: 120, nullable: true })
  address: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Column({
    name: 'refresh_token_hash',
    type: 'varchar',
    nullable: true,
    select: false,
  })
  refreshTokenHash: string | null;

  @Column({
    name: 'reset_token_hash',
    type: 'varchar',
    nullable: true,
    select: false,
  })
  resetTokenHash: string | null;

  @Column({
    name: 'reset_token_expires_at',
    type: 'timestamptz',
    nullable: true,
  })
  resetTokenExpiresAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Review, (r) => r.user, { cascade: false })
  reviews?: Review[];

  @OneToMany(() => ClassHistory, (classHistory) => classHistory.user)
  classHistories: ClassHistory[];

  @OneToMany(() => Payment, (payment) => payment.user)
  payments: Payment[];
}