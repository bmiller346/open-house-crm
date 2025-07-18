import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { Workspace } from './Workspace';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('varchar', { length: 255, unique: true })
  email!: string;

  @Column('varchar', { length: 255 })
  firstName!: string;

  @Column('varchar', { length: 255 })
  lastName!: string;

  @Column('varchar', { length: 20, nullable: true })
  phone?: string;

  @Column('varchar', { length: 500, nullable: true })
  avatar?: string;

  @Column('boolean', { default: false })
  isEmailVerified!: boolean;

  @Column('timestamp', { nullable: true })
  lastLoginAt?: Date;

  @Column('jsonb', { default: {} })
  preferences!: any;

  @Column('varchar', { length: 255, nullable: true })
  passwordHash?: string;

  @Column('varchar', { length: 255, nullable: true })
  googleId?: string;

  @Column('varchar', { length: 255, nullable: true })
  linkedinId?: string;

  @Column('varchar', { length: 500, nullable: true })
  refreshToken?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column('timestamp', { nullable: true })
  deletedAt?: Date;

  // Relations
  @ManyToMany(() => Workspace, workspace => workspace.users)
  @JoinTable({
    name: 'workspace_users',
    joinColumn: { name: 'userId' },
    inverseJoinColumn: { name: 'workspaceId' }
  })
  workspaces!: Workspace[];

  // Computed properties
  get displayName(): string {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  get fullName(): string {
    return this.displayName;
  }
}
