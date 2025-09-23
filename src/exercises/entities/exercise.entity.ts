import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export type ProgramTag = 'max' | 'hyper' | null;

@Entity({ name: 'exercises' })
@Index(['muscleGroup', 'name'])
export class Exercise {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 120 })
  name: string;

  @Column({ name: 'muscle_group', length: 50 })
  muscleGroup: string;

  @Column({ type: 'int', nullable: true })
  series: number | null;

  @Column({ type: 'int', nullable: true })
  repetitions: number | null;

  @Column({ type: 'varchar', length: 30, nullable: true })
  type: string | null;

  @Column({ name: 'program_tag', type: 'varchar', length: 10, nullable: true })
  programTag: ProgramTag;

  // Nueva columna para la imagen
  @Column({ name: 'image_url', type: 'varchar', nullable: true, length: 500 })
  imageUrl: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}