import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { KycDocument } from '../../documents/entities/kyc-document.entity';
import { WorkflowJob } from '../../workflows/entities/workflow-job.entity';
import { User } from '../../users/entities/user.entity';

export enum ClientType {
  INDIVIDUAL = 'INDIVIDUAL',
  BUSINESS = 'BUSINESS',
}

export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum ClientStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  UNDER_REVIEW = 'UNDER_REVIEW',
  SUSPENDED = 'SUSPENDED',
  CLOSED = 'CLOSED',
}

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: 'enum', enum: ClientType, default: ClientType.INDIVIDUAL })
  type: ClientType;

  @Column({ type: 'enum', enum: ClientStatus, default: ClientStatus.PENDING })
  status: ClientStatus;

  @Column({ type: 'enum', enum: RiskLevel, default: RiskLevel.MEDIUM })
  riskLevel: RiskLevel;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  riskScore: number;

  @Column({ name: 'business_name', nullable: true })
  businessName: string;

  @Column({ name: 'registration_number', nullable: true })
  registrationNumber: string;

  @Column({ name: 'tax_id', nullable: true })
  taxId: string;

  @Column({ type: 'json', nullable: true })
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };

  @Column({ name: 'date_of_birth', nullable: true })
  dateOfBirth: Date;

  @Column({ name: 'nationality', nullable: true })
  nationality: string;

  @Column({ name: 'id_document_type', nullable: true })
  idDocumentType: string;

  @Column({ name: 'id_document_number', nullable: true })
  idDocumentNumber: string;

  @Column({ name: 'id_document_expiration', nullable: true })
  idDocumentExpiration: Date;

  @Column({ type: 'json', nullable: true })
  kycData: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  amlData: Record<string, any>;

  @Column({ name: 'last_kyc_review', nullable: true })
  lastKycReview: Date;

  @Column({ name: 'next_kyc_review', nullable: true })
  nextKycReview: Date;

  @Column({ name: 'assigned_to_id', nullable: true })
  assignedToId: string;

  @ManyToOne(() => User, user => user.assignedClients)
  @JoinColumn({ name: 'assigned_to_id' })
  assignedTo: User;

  @OneToMany(() => KycDocument, document => document.client)
  documents: KycDocument[];

  @OneToMany(() => WorkflowJob, job => job.client)
  workflowJobs: WorkflowJob[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
