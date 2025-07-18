import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Workspace } from './Workspace';

@Entity('api_keys')
@Index(['workspaceId'])
@Index(['isActive'])
@Index(['keyHash'])
export class ApiKey {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid', { name: 'workspace_id' })
  workspaceId!: string;

  @Column('varchar', { length: 100 })
  name!: string;

  @Column('text', { nullable: true })
  description?: string;

  @Column('varchar', { length: 255, name: 'key_hash' })
  keyHash!: string; // Store hashed version of the key

  @Column('varchar', { length: 20, name: 'key_prefix' })
  keyPrefix!: string; // Store first 8 chars for display (ohc_12345678...)

  @Column('text', { array: true })
  permissions!: string[]; // ['read:contacts', 'write:contacts', 'read:webhooks', etc.]

  @Column('text', { array: true, nullable: true })
  ipWhitelist?: string[]; // Optional IP restrictions

  @Column('boolean', { name: 'is_active', default: true })
  isActive!: boolean;

  @Column('timestamp', { name: 'last_used_at', nullable: true })
  lastUsedAt?: Date;

  @Column('timestamp', { name: 'expires_at', nullable: true })
  expiresAt?: Date;

  @Column('uuid', { name: 'created_by' })
  createdBy!: string;

  @Column('uuid', { name: 'updated_by', nullable: true })
  updatedBy?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Relations
  @ManyToOne(() => Workspace, workspace => workspace.id)
  @JoinColumn({ name: 'workspace_id' })
  workspace!: Workspace;
}
