import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('calculators')
export class Calculator {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('varchar', { length: 255 })
  name!: string;

  @Column('text')
  description!: string;

  @Column({
    type: 'enum',
    enum: ['wholesaling', 'investment', 'financing', 'rehab']
  })
  category!: string;

  @Column('jsonb')
  inputs!: CalculatorInput[];

  @Column('text')
  formula!: string;

  @Index()
  @Column('uuid')
  workspaceId!: string;

  @Column('boolean', { default: true })
  isActive!: boolean;
}

export interface CalculatorInput {
  name: string;
  label: string;
  type: 'number' | 'currency' | 'percentage' | 'text';
  required: boolean;
  defaultValue?: any;
  min?: number;
  max?: number;
  placeholder?: string;
  helpText?: string;
}
