import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Client } from '../../clients/entities/client.entity';
import { KycRecord } from '../../kyc/entities/kyc-record.entity';

export enum JobStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  RETRYING = 'RETRYING',
}

export enum JobType {
  KYC_VERIFICATION = 'KYC_VERIFICATION',
  DOCUMENT_OCR = 'DOCUMENT_OCR',
  AML_SCREENING = 'AML_SCREENING',
  RISK_SCORING = 'RISK_SCORING',
  DOCUMENT_VERIFICATION = 'DOCUMENT_VERIFICATION',
  RULES_EXECUTION = 'RULES_EXECUTION',
  ALERT_GENERATION = 'ALERT_GENERATION',
  KYC_REVIEW_REMINDER = 'KYC_REVIEW_REMINDER',
  DOCUMENT_EXPIRY_CHECK = 'DOCUMENT_EXPIRY_CHECK',
}

export enum JobPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

@Entity('workflow_jobs')
export class WorkflowJob {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: JobType })
  type: JobType;

  @Column({ type: 'enum', enum: JobStatus, default: JobStatus.PENDING })
  status: JobStatus;

  @Column({ type: 'enum', enum: JobPriority, default: JobPriority.NORMAL })
  priority: JobPriority;

  @Column({ name: 'client_id', nullable: true })
  clientId: string;

  @ManyToOne(() => Client, client => client.workflowJobs)
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @Column({ name: 'kyc_record_id', nullable: true })
  kycRecordId: string;

  @ManyToOne(() => KycRecord)
  @JoinColumn({ name: 'kyc_record_id' })
  kycRecord: KycRecord;

  @Column({ type: 'json', nullable: true })
  inputData: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  outputData: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ type: 'int', default: 0 })
  retryCount: number;

  @Column({ type: 'int', default: 3 })
  maxRetries: number;

  @Column({ name: 'scheduled_at', nullable: true })
  scheduledAt: Date;

  @Column({ name: 'started_at', nullable: true })
  startedAt: Date;

  @Column({ name: 'completed_at', nullable: true })
  completedAt: Date;

  @Column({ type: 'int', nullable: true })
  duration: number; // in seconds

  @Column({ name: 'created_by_id', nullable: true })
  createdById: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
