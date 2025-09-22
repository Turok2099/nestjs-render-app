import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn,
  CreateDateColumn, Unique, Index
} from 'typeorm';
import { Class } from './class.entity';
import { User } from '../../user/entities/user.entity';

export type ReservationStatus = 'booked' | 'cancelled' | 'attended' | 'no_show';

@Entity({ name: 'reservations' })
@Unique(['classId', 'userId'])
@Index(['userId', 'createdAt'])
export class Reservation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Class, { eager: false, nullable: false })
  @JoinColumn({ name: 'class_id' })
  class: Class;

  @Column({ name: 'class_id' })
  classId: string;

  @ManyToOne(() => User, { eager: false, nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ type: 'varchar', length: 12, default: 'booked' })
  status: ReservationStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
