import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  workspaceId!: string;

  @Column('uuid')
  contactId!: string;

  @Column('varchar', { length: 100 })
  pipelineStage!: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
