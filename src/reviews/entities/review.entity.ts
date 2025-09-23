import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn,
  CreateDateColumn, UpdateDateColumn, Index
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

export type ReviewStatus = 'approved' | 'pending' | 'rejected';

@Entity({ name: 'reviews' })
@Index(['userId', 'createdAt'])
@Index(['isActive', 'status'])
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { eager: false, nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  // Campos opcionales por si luego reseñan clase/entrenador específico
  @Column({ name: 'class_id', type: 'uuid', nullable: true })
  classId: string | null;

  @Column({ name: 'trainer_id', type: 'uuid', nullable: true })
  trainerId: string | null;

  @Column({ type: 'int' })
  rating: number; // 1..5

  @Column({ type: 'varchar', length: 500, nullable: true })
  comment: string | null;

  // Moderación y borrado lógico
  @Column({ name: 'status', type: 'varchar', length: 10, default: 'approved' })
  status: ReviewStatus;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' }) 
  createdAt: Date;
  
  @UpdateDateColumn({ name: 'updated_at' }) 
  updatedAt: Date;
}