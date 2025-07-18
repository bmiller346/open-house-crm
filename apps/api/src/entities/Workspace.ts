import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { Contact } from './Contact';
import { User } from './User';
import { CommercialPropertyRecord } from './CountyRecord';

@Entity('workspaces')
export class Workspace {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('varchar', { length: 255 })
  name!: string;

  @Column('varchar', { length: 100, unique: true })
  slug!: string;

  @Column('uuid')
  ownerId!: string;

  @Column({ 
    type: 'enum', 
    enum: ['free', 'pro', 'enterprise'],
    default: 'free' 
  })
  subscriptionPlan!: 'free' | 'pro' | 'enterprise';

  @Column('boolean', { default: true })
  isActive!: boolean;

  @Column('jsonb', { default: {} })
  settings!: {
    timezone: string;
    currency: string;
    dateFormat: string;
    branding?: {
      logo?: string;
      primaryColor?: string;
      secondaryColor?: string;
    };
    integrations?: Record<string, any>;
  };

  @Column('jsonb', { default: [] })
  integrations!: any[];

  @Column('jsonb', { default: [] })
  apiKeys!: any[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column('timestamp', { nullable: true })
  deletedAt?: Date;

  // Relationships
  @OneToMany(() => Contact, contact => contact.workspace)
  contacts!: Contact[];

  @OneToMany(() => CommercialPropertyRecord, record => record.workspace)
  commercialPropertyRecords!: CommercialPropertyRecord[];

  @ManyToMany(() => User, user => user.workspaces)
  @JoinTable({
    name: 'workspace_users',
    joinColumn: { name: 'workspaceId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' }
  })
  users!: User[];
}
