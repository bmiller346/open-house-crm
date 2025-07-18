import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from './User';
import { Workspace } from './Workspace';
import { ResourceDocument } from './ResourceDocument';
// import { Deal } from './Deal'; // Assuming a Deal entity exists
// import { Contact } from './Contact'; // Assuming a Contact entity exists

@Entity('user_notes')
export class UserNote {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column('uuid')
  userId!: string;

  @Index()
  @Column('uuid')
  workspaceId!: string;

  @Column('varchar', { length: 255 })
  title!: string;

  @Column('text')
  content!: string;

  @Column('simple-array', { nullable: true })
  tags!: string[];

  @Index()
  @Column('uuid', { nullable: true })
  resourceId?: string;

  @Index()
  @Column('uuid', { nullable: true })
  dealId?: string;

  @Index()
  @Column('uuid', { nullable: true })
  contactId?: string;

  @Column('boolean', { default: true })
  isPrivate!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @ManyToOne(() => Workspace, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workspaceId' })
  workspace!: Workspace;

  @ManyToOne(() => ResourceDocument, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'resourceId' })
  resource!: ResourceDocument;

  // @ManyToOne(() => Deal, { nullable: true, onDelete: 'SET NULL' })
  // @JoinColumn({ name: 'dealId' })
  // deal: Deal;

  // @ManyToOne(() => Contact, { nullable: true, onDelete: 'SET NULL' })
  // @JoinColumn({ name: 'contactId' })
  // contact: Contact;
}
