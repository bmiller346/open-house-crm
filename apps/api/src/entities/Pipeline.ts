import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Pipeline {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  workspaceId!: string;

  @Column('varchar', { length: 255 })
  name!: string;

  @Column('simple-array')
  stages!: string[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
