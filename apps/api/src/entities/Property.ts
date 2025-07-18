import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Workspace } from './Workspace';

@Entity('properties')
@Index(['workspaceId'])
export class Property {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  workspaceId!: string;

  @Column({ type: 'varchar', length: 500 })
  address!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  state!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  zipCode!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  propertyType!: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  price!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  squareFootage!: number;

  @Column({ type: 'int', nullable: true })
  bedrooms!: number;

  @Column({ type: 'int', nullable: true })
  bathrooms!: number;

  @Column({ type: 'varchar', length: 50, default: 'available' })
  status!: string; // available, under_contract, sold, off_market

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ type: 'json', nullable: true })
  images!: string[];

  @Column({ type: 'json', nullable: true })
  features!: Record<string, any>;

  @Column({ type: 'varchar', length: 255, nullable: true })
  mlsNumber!: string;

  @Column({ type: 'date', nullable: true })
  listingDate!: Date;

  @Column({ type: 'uuid', nullable: true })
  createdBy!: string;

  @Column({ type: 'uuid', nullable: true })
  updatedBy!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => Workspace)
  @JoinColumn({ name: 'workspaceId' })
  workspace!: Workspace;
}