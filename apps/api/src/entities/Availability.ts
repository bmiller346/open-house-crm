import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  JoinColumn, 
  CreateDateColumn, 
  UpdateDateColumn 
} from 'typeorm';
import { User } from './User';

export type AvailabilityType = 'available' | 'busy' | 'tentative' | 'out_of_office';
export type RecurringPattern = 'none' | 'daily' | 'weekly' | 'monthly';

@Entity('availability')
export class Availability {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  workspaceId!: string;

  @Column({ type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ type: 'varchar', length: 200, nullable: true })
  title?: string;

  @Column({ type: 'enum', enum: ['available', 'busy', 'tentative', 'out_of_office'], default: 'available' })
  type!: AvailabilityType;

  @Column({ type: 'timestamp' })
  startTime!: Date;

  @Column({ type: 'timestamp' })
  endTime!: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  timezone?: string;

  @Column({ type: 'boolean', default: false })
  isRecurring!: boolean;

  @Column({ type: 'enum', enum: ['none', 'daily', 'weekly', 'monthly'], default: 'none' })
  recurringPattern!: RecurringPattern;

  @Column({ type: 'jsonb', nullable: true })
  recurringSettings?: {
    interval: number;
    endDate?: Date;
    daysOfWeek?: number[];
    daysOfMonth?: number[];
  };

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: {
    reason?: string;
    location?: string;
    autoBlock?: boolean;
  };

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
