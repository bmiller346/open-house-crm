import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Webhook } from './Webhook';

@Entity('webhook_secrets')
@Index(['webhookId'])
@Index(['isActive'])
export class WebhookSecret {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid', { name: 'webhook_id' })
  webhookId!: string;

  @Column('varchar', { length: 255 })
  secret!: string;

  @Column('boolean', { name: 'is_active', default: true })
  isActive!: boolean;

  @Column('timestamp', { name: 'expires_at', nullable: true })
  expiresAt?: Date;

  @Column('uuid', { name: 'created_by' })
  createdBy!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  // Relations
  @ManyToOne(() => Webhook, webhook => webhook.id)
  @JoinColumn({ name: 'webhook_id' })
  webhook!: Webhook;
}
