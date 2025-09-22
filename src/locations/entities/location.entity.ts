import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity({ name: 'locations' })
@Index(['country', 'city'])
export class Location {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 120 })
  name: string; 

  @Column({ length: 120 })
  country: string; // "Argentina" | "Colombia" | "México"

  @Column({ length: 120 })
  city: string; 

  @Column({ length: 200 })
  address: string; 

  @Column('decimal', { precision: 10, scale: 6 })
  lat: string;

  @Column('decimal', { precision: 10, scale: 6 })
  lng: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
