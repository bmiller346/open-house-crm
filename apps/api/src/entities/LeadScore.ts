import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Contact } from './Contact';

@Entity('lead_scores')
export class LeadScore {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  workspaceId!: string;

  @Column('uuid')
  contactId!: string;

  @Column('decimal', { precision: 5, scale: 2 })
  score!: number;

  @Column('varchar', { length: 50 })
  category!: 'hot' | 'warm' | 'cold' | 'qualified' | 'unqualified';

  @Column('int')
  confidence!: number; // 0-100

  @Column('jsonb')
  factors!: {
    demographic: number;
    behavioral: number;
    engagement: number;
    financial: number;
    timing: number;
    intent: number;
  };

  @Column('jsonb')
  insights!: {
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    nextBestAction: string;
    estimatedCloseTime: number; // days
    estimatedValue: number;
  };

  @Column('jsonb', { nullable: true })
  metadata!: {
    modelVersion: string;
    computedAt: Date;
    dataPoints: number;
    lastActivityDate?: Date;
    sourceChannels: string[];
  };

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Relations
  @ManyToOne(() => Contact, contact => contact.id)
  @JoinColumn({ name: 'contactId' })
  contact!: Contact;
}
