import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export type ProgramTag = 'max' | 'hyper' | null;

@Entity({ name: 'exercises' })
@Index(['grupo', 'ejercicio'])
export class Exercise {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'ejercicio', length: 120 })
  ejercicio: string;

  @Column({ name: 'grupo', length: 50, nullable: true })
  grupo: string | null;

  @Column({ name: 'categoria', length: 30, nullable: true })
  categoria: string | null;

  @Column({ name: 'imagen_grupo', type: 'varchar', nullable: true, length: 500 })
  imagenGrupo: string | null;

  @Column({ name: 'imagen_ejercicio', type: 'varchar', nullable: true, length: 500 })
  imagenEjercicio: string | null;

  @Column({ name: 'fuerza_series', type: 'int', nullable: true })
  fuerzaSeries: number | null;

  @Column({ name: 'fuerza_repeticiones', type: 'int', nullable: true })
  fuerzaRepeticiones: number | null;

  @Column({ name: 'hipertrofia_series', type: 'int', nullable: true })
  hipertrofiaSeries: number | null;

  @Column({ name: 'hipertrofia_repeticiones', type: 'int', nullable: true })
  hipertrofiaRepeticiones: number | null;

  @Column({ name: 'resistencia_series', type: 'int', nullable: true })
  resistenciaSeries: number | null;

  @Column({ name: 'resistencia_repeticiones', type: 'varchar', nullable: true, length: 50 })
  resistenciaRepeticiones: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;

  // Campos legacy para compatibilidad (nullable)
  @Column({ type: 'int', nullable: true })
  series: number | null;

  @Column({ type: 'int', nullable: true })
  repetitions: number | null;

  @Column({ type: 'varchar', length: 30, nullable: true })
  type: string | null;

  @Column({ name: 'program_tag', type: 'varchar', length: 10, nullable: true })
  programTag: ProgramTag;

  @Column({ name: 'image_url', type: 'varchar', nullable: true, length: 500 })
  imageUrl: string | null;
}