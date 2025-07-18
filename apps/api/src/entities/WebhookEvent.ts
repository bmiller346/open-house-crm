import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Webhook } from './Webhook';

@Entity('webhook_events')
@Index(['webhookId'])
@Index(['eventType'])
export class WebhookEvent {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid', { name: 'webhook_id' })
  webhookId!: string;

  @Column('varchar', { length: 100, name: 'event_type' })
  eventType!: string;

  @Column('jsonb')
  payload!: any;

  @Column('varchar', { length: 50 })
  status!: string; // 'pending', 'processing', 'delivered', 'failed', 'retrying'

  @Column('integer', { name: 'retry_count', default: 0 })
  retryCount!: number;

  @Column('timestamp', { name: 'next_retry_at', nullable: true })
  nextRetryAt?: Date;

  @Column('timestamp', { name: 'processed_at', nullable: true })
  processedAt?: Date;

  @Column('text', { nullable: true })
  error?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  // Relations
  @ManyToOne(() => Webhook, webhook => webhook.id)
  @JoinColumn({ name: 'webhook_id' })
  webhook!: Webhook;
}
