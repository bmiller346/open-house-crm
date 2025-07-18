import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from './User';
import { Workspace } from './Workspace';

@Entity('scripts')
export class Script {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('varchar', { length: 255 })
  title!: string;

  @Column({
    type: 'enum',
    enum: ['cold_call', 'follow_up', 'negotiation', 'email', 'voicemail']
  })
  category!: string;

  @Column('text')
  situation!: string;

  @Column('text')
  script!: string;

  @Column('simple-array', { nullable: true })
  tips!: string[];

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  successRate?: number;

  @Index()
  @Column('uuid')
  workspaceId!: string;

  @Column('uuid')
  createdBy!: string;

  @Column('boolean', { default: true })
  isPublic!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'createdBy' })
  author!: User;

  @ManyToOne(() => Workspace, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workspaceId' })
  workspace!: Workspace;
}
