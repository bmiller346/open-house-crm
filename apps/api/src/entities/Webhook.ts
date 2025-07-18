import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Workspace } from './Workspace';

@Entity('webhooks')
@Index(['workspaceId'])
@Index(['isActive'])
export class Webhook {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid', { name: 'workspace_id' })
  workspaceId!: string;

  @Column('varchar', { length: 500 })
  url!: string;

  @Column('text', { array: true })
  events!: string[];

  @Column('varchar', { length: 255 })
  secret!: string;

  @Column('text', { nullable: true })
  description?: string;

  @Column('boolean', { name: 'is_active', default: true })
  isActive!: boolean;

  @Column('uuid', { name: 'created_by' })
  createdBy!: string;

  @Column('uuid', { name: 'updated_by', nullable: true })
  updatedBy?: string;

  @Column('integer', { name: 'delivery_attempts', default: 0 })
  deliveryAttempts!: number;

  @Column('integer', { name: 'failed_attempts', default: 0 })
  failedAttempts!: number;

  @Column('timestamp', { name: 'last_delivery_at', nullable: true })
  lastDeliveryAt?: Date;

  @Column('timestamp', { name: 'last_success_at', nullable: true })
  lastSuccessAt?: Date;

  @Column('timestamp', { name: 'last_failure_at', nullable: true })
  lastFailureAt?: Date;

  @Column('text', { name: 'last_error', nullable: true })
  lastError?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Relations
  @ManyToOne(() => Workspace, workspace => workspace.id)
  @JoinColumn({ name: 'workspace_id' })
  workspace!: Workspace;
}
