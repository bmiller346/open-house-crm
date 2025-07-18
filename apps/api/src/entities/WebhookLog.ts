import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Webhook } from './Webhook';

@Entity('webhook_logs')
@Index(['webhookId'])
@Index(['success'])
@Index(['createdAt'])
export class WebhookLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid', { name: 'webhook_id' })
  webhookId!: string;

  @Column('varchar', { length: 100 })
  event!: string;

  @Column('jsonb')
  payload!: any;

  @Column('boolean', { default: false })
  success!: boolean;

  @Column('integer', { name: 'status_code', nullable: true })
  statusCode?: number;

  @Column('integer', { name: 'response_time', nullable: true })
  responseTime?: number;

  @Column('text', { nullable: true })
  error?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  // Relations
  @ManyToOne(() => Webhook, webhook => webhook.id)
  @JoinColumn({ name: 'webhook_id' })
  webhook!: Webhook;
}
