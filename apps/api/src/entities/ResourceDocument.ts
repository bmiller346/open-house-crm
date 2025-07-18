import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from './User';
import { Workspace } from './Workspace';

@Entity('resource_documents')
export class ResourceDocument {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('varchar', { length: 255 })
  title!: string;

  @Column({
    type: 'enum',
    enum: ['legal', 'marketing', 'analytics', 'process', 'wholesaling', 'scripts']
  })
  category!: string;

  @Column('varchar', { length: 100, nullable: true })
  subCategory!: string;

  @Column('text')
  content!: string;

  @Index({ fulltext: true })
  @Column('simple-array')
  tags!: string[];

  @Column({
    type: 'enum',
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  })
  difficulty!: string;

  @Column('integer', { default: 5 })
  estimatedReadTime!: number;

  @Column('integer', { default: 0 })
  views!: number;

  @Column('integer', { default: 0 })
  likes!: number;

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
