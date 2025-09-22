import { Max, Min } from 'class-validator';
import { User } from '../../user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ type: 'text' })
  text: string;

  @Column({ type: 'int' })
  @Min(1)
  @Max(5)
  rating: number;

  @Column({ type: 'date' })
  date: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}
