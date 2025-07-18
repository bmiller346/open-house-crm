import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Campaign {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  workspaceId!: string;

  @Column('varchar', { length: 255 })
  name!: string;

  @Column('varchar', { length: 50 })
  status!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
