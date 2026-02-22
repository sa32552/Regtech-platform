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
import { User } from '../../users/entities/user.entity';

export enum AlertSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum AlertStatus {
  NEW = 'NEW',
  UNDER_REVIEW = 'UNDER_REVIEW',
  RESOLVED = 'RESOLVED',
  DISMISSED = 'DISMISSED',
  ESCALATED = 'ESCALATED',
}

export enum AlertType {
  SANCTIONS_MATCH = 'SANCTIONS_MATCH',
  PEP_MATCH = 'PEP_MATCH',
  ADVERSE_MEDIA = 'ADVERSE_MEDIA',
  SUSPICIOUS_TRANSACTION = 'SUSPICIOUS_TRANSACTION',
  UNUSUAL_PATTERN = 'UNUSUAL_PATTERN',
  HIGH_RISK_JURISDICTION = 'HIGH_RISK_JURISDICTION',
  DOCUMENT_EXPIRY = 'DOCUMENT_EXPIRY',
  KYC_REVIEW_DUE = 'KYC_REVIEW_DUE',
  RULE_VIOLATION = 'RULE_VIOLATION',
  RISK_THRESHOLD = 'RISK_THRESHOLD',
  MANUAL_ENTRY = 'MANUAL_ENTRY',
}

@Entity('aml_alerts')
export class AmlAlert {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'client_id' })
  clientId: string;

  @ManyToOne(() => Client)
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @Column({ type: 'enum', enum: AlertType })
  type: AlertType;

  @Column({ type: 'enum', enum: AlertSeverity })
  severity: AlertSeverity;

  @Column({ type: 'enum', enum: AlertStatus, default: AlertStatus.NEW })
  status: AlertStatus;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'json', nullable: true })
  details: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  matchDetails: {
    source: string;
    matchScore: number;
    matchedFields: string[];
    additionalInfo?: Record<string, any>;
  };

  @Column({ type: 'json', nullable: true })
  transactionDetails: {
    transactionId: string;
    amount: number;
    currency: string;
    date: Date;
    description?: string;
  };

  @Column({ type: 'json', nullable: true })
  riskFactors: Array<{
    type: string;
    description: string;
    severity: AlertSeverity;
    impact: number;
  }>;

  @Column({ type: 'int', default: 0 })
  riskScore: number;

  @Column({ type: 'text', nullable: true })
  resolutionNotes: string;

  @Column({ name: 'resolved_by_id', nullable: true })
  resolvedById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'resolved_by_id' })
  resolvedBy: User;

  @Column({ name: 'resolved_at', nullable: true })
  resolvedAt: Date;

  @Column({ name: 'assigned_to_id', nullable: true })
  assignedToId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'assigned_to_id' })
  assignedTo: User;

  @Column({ name: 'acknowledged_at', nullable: true })
  acknowledgedAt: Date;

  @Column({ name: 'acknowledged_by_id', nullable: true })
  acknowledgedById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'acknowledged_by_id' })
  acknowledgedBy: User;

  @Column({ type: 'boolean', default: false })
  isEscalated: boolean;

  @Column({ name: 'escalated_at', nullable: true })
  escalatedAt: Date;

  @Column({ name: 'escalated_to_id', nullable: true })
  escalatedToId: string;

  @Column({ name: 'escalation_reason', type: 'text', nullable: true })
  escalationReason: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
