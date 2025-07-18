import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  JoinColumn, 
  CreateDateColumn, 
  UpdateDateColumn 
} from 'typeorm';
import { Contact } from './Contact';
import { User } from './User';
// import { Property } from './Property'; // Temporarily disabled

export type AppointmentType = 'viewing' | 'meeting' | 'call' | 'inspection' | 'signing' | 'consultation';
export type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled' | 'no_show';
export type AppointmentPriority = 'low' | 'medium' | 'high' | 'urgent';

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  workspaceId!: string;

  @Column({ type: 'varchar', length: 200 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'enum', enum: ['viewing', 'meeting', 'call', 'inspection', 'signing', 'consultation'] })
  type!: AppointmentType;

  @Column({ type: 'enum', enum: ['scheduled', 'confirmed', 'completed', 'cancelled', 'rescheduled', 'no_show'], default: 'scheduled' })
  status!: AppointmentStatus;

  @Column({ type: 'enum', enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' })
  priority!: AppointmentPriority;

  @Column({ type: 'timestamp' })
  startTime!: Date;

  @Column({ type: 'timestamp' })
  endTime!: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  timezone?: string;

  @Column({ type: 'text', nullable: true })
  location?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  meetingUrl?: string;

  @Column({ type: 'uuid', nullable: true })
  contactId?: string;

  @ManyToOne(() => Contact, { nullable: true })
  @JoinColumn({ name: 'contactId' })
  contact?: Contact;

  @Column({ type: 'uuid' })
  assignedToId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'assignedToId' })
  assignedTo!: User;

  @Column({ type: 'uuid', nullable: true })
  propertyId?: string;

  // Property relationship temporarily disabled
  /*
  @ManyToOne(() => Property, { nullable: true })
  @JoinColumn({ name: 'propertyId' })
  property?: Property;
  */

  @Column({ type: 'jsonb', nullable: true })
  attendees?: {
    name: string;
    email: string;
    phone?: string;
    confirmed: boolean;
  }[];

  @Column({ type: 'jsonb', nullable: true })
  reminders?: {
    type: 'email' | 'sms' | 'push';
    minutesBefore: number;
    sent: boolean;
  }[];

  @Column({ type: 'jsonb', nullable: true })
  metadata?: {
    source?: string;
    leadScore?: number;
    estimatedDuration?: number;
    preparationNotes?: string;
    followUpRequired?: boolean;
    outcome?: string;
    notes?: string;
  };

  @Column({ type: 'boolean', default: false })
  isRecurring!: boolean;

  @Column({ type: 'jsonb', nullable: true })
  recurringPattern?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
    endDate?: Date;
    daysOfWeek?: number[];
  };

  @Column({ type: 'uuid', nullable: true })
  parentAppointmentId?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
