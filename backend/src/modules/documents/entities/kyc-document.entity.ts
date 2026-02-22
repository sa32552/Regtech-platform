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

export enum DocumentType {
  ID_CARD = 'ID_CARD',
  PASSPORT = 'PASSPORT',
  DRIVING_LICENSE = 'DRIVING_LICENSE',
  RESIDENCE_PROOF = 'RESIDENCE_PROOF',
  BANK_STATEMENT = 'BANK_STATEMENT',
  TAX_RETURN = 'TAX_RETURN',
  BUSINESS_REGISTRATION = 'BUSINESS_REGISTRATION',
  ARTICLE_OF_ASSOCIATION = 'ARTICLE_OF_ASSOCIATION',
  SHAREHOLDER_DECLARATION = 'SHAREHOLDER_DECLARATION',
  OTHER = 'OTHER',
}

export enum DocumentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}

@Entity('kyc_documents')
export class KycDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'client_id' })
  clientId: string;

  @ManyToOne(() => Client, client => client.documents)
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @Column({ type: 'enum', enum: DocumentType })
  type: DocumentType;

  @Column({ type: 'enum', enum: DocumentStatus, default: DocumentStatus.PENDING })
  status: DocumentStatus;

  @Column()
  filename: string;

  @Column()
  originalName: string;

  @Column()
  mimeType: string;

  @Column({ type: 'bigint' })
  size: number;

  @Column({ name: 'file_path' })
  filePath: string;

  @Column({ name: 'minio_bucket', nullable: true })
  minioBucket: string;

  @Column({ name: 'minio_object_name', nullable: true })
  minioObjectName: string;

  @Column({ name: 'uploaded_by_id', nullable: true })
  uploadedById: string;

  @Column({ name: 'verified_by_id', nullable: true })
  verifiedById: string;

  @Column({ name: 'verified_at', nullable: true })
  verifiedAt: Date;

  @Column({ type: 'json', nullable: true })
  ocrData: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  extractedData: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason: string;

  @Column({ name: 'expiration_date', nullable: true })
  expirationDate: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
