import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum RuleType {
  KYC_VERIFICATION = 'KYC_VERIFICATION',
  AML_SCREENING = 'AML_SCREENING',
  RISK_SCORING = 'RISK_SCORING',
  DOCUMENT_VERIFICATION = 'DOCUMENT_VERIFICATION',
  TRANSACTION_MONITORING = 'TRANSACTION_MONITORING',
  SANCTIONS_CHECK = 'SANCTIONS_CHECK',
  PEP_CHECK = 'PEP_CHECK',
  ADVERSE_MEDIA_CHECK = 'ADVERSE_MEDIA_CHECK',
  GEOGRAPHIC_RISK = 'GEOGRAPHIC_RISK',
  BUSINESS_TYPE_RISK = 'BUSINESS_TYPE_RISK',
  CUSTOM = 'CUSTOM',
}

export enum RuleStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DRAFT = 'DRAFT',
  ARCHIVED = 'ARCHIVED',
}

export enum RuleSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum RuleExecutionFrequency {
  REAL_TIME = 'REAL_TIME',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  ON_DEMAND = 'ON_DEMAND',
}

@Entity('rules')
export class Rule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: RuleType })
  type: RuleType;

  @Column({ type: 'enum', enum: RuleStatus, default: RuleStatus.DRAFT })
  status: RuleStatus;

  @Column({ type: 'enum', enum: RuleSeverity })
  severity: RuleSeverity;

  @Column({ type: 'enum', enum: RuleExecutionFrequency, default: RuleExecutionFrequency.ON_DEMAND })
  executionFrequency: RuleExecutionFrequency;

  @Column({ type: 'json' })
  conditions: Record<string, any>;

  @Column({ type: 'json' })
  actions: Array<{
    type: string;
    parameters: Record<string, any>;
  }>;

  @Column({ type: 'int', default: 0 })
  riskScoreImpact: number;

  @Column({ type: 'json', nullable: true })
  parameters: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  regulatoryReference: string;

  @Column({ type: 'json', nullable: true })
  versionHistory: Array<{
    version: number;
    changedAt: Date;
    changedBy: string;
    changes: string[];
  }>;

  @Column({ type: 'int', default: 1 })
  version: number;

  @Column({ type: 'boolean', default: false })
  isSystemRule: boolean;

  @Column({ type: 'boolean', default: false })
  requiresManualReview: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'created_by_id' })
  createdById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @Column({ name: 'updated_by_id', nullable: true })
  updatedById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'updated_by_id' })
  updatedBy: User;

  @Column({ type: 'int', default: 0 })
  executionCount: number;

  @Column({ type: 'int', default: 0 })
  successCount: number;

  @Column({ type: 'int', default: 0 })
  failureCount: number;

  @Column({ type: 'timestamp', nullable: true })
  lastExecutedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastSuccessAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastFailureAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
