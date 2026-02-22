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

export enum KycStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
}

export enum KycLevel {
  BASIC = 'BASIC',
  STANDARD = 'STANDARD',
  ENHANCED = 'ENHANCED',
}

@Entity('kyc_records')
export class KycRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'client_id' })
  clientId: string;

  @ManyToOne(() => Client, client => client.kycRecords)
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @Column({ type: 'enum', enum: KycStatus, default: KycStatus.PENDING })
  status: KycStatus;

  @Column({ type: 'enum', enum: KycLevel, default: KycLevel.BASIC })
  level: KycLevel;

  @Column({ type: 'json', nullable: true })
  personalInfo: {
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    nationality: string;
    idDocumentType: string;
    idDocumentNumber: string;
    idDocumentExpiration: Date;
  };

  @Column({ type: 'json', nullable: true })
  addressInfo: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    proofOfAddressDocumentId: string;
  };

  @Column({ type: 'json', nullable: true })
  businessInfo: {
    businessName: string;
    registrationNumber: string;
    taxId: string;
    incorporationDate: Date;
    businessAddress: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
  };

  @Column({ type: 'json', nullable: true })
  beneficialOwners: Array<{
    name: string;
    percentage: number;
    idDocumentType: string;
    idDocumentNumber: string;
    idDocumentExpiration: Date;
  }>;

  @Column({ type: 'json', nullable: true })
  riskFactors: Array<{
    type: string;
    description: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
  }>;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  riskScore: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string;

  @Column({ name: 'submitted_by_id', nullable: true })
  submittedById: string;

  @Column({ name: 'reviewed_by_id', nullable: true })
  reviewedById: string;

  @Column({ name: 'submitted_at', nullable: true })
  submittedAt: Date;

  @Column({ name: 'completed_at', nullable: true })
  completedAt: Date;

  @Column({ name: 'next_review_date', nullable: true })
  nextReviewDate: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
