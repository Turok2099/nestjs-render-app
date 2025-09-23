import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { Class } from './class.entity';
import { User } from '../../user/entities/user.entity';

export type ClassHistoryStatus = 'attended' | 'missed' | 'cancelled';

@Entity({ name: 'class_histories' })
export class ClassHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Relación a la clase
  @ManyToOne(() => Class, (c) => c.classHistories, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'class_id' })
  class: Class;

  @Column({ name: 'class_id', type: 'uuid' })
  classId: string;

  // Relación al usuario (sin inverso para no exigir user.classHistories)
  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', length: 10, default: 'attended' })
  status: ClassHistoryStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}