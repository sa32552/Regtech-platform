import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsObject, IsOptional, IsArray, IsNumber, IsDateString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { AlertSeverity, AlertStatus, AlertType } from '../entities/aml-alert.entity';
import { CreateAmlAlertDto } from './create-aml-alert.dto';

export class UpdateAmlAlertDto extends PartialType(CreateAmlAlertDto) {
  @ApiProperty({ enum: AlertStatus, required: false })
  @IsEnum(AlertStatus)
  @IsOptional()
  status?: AlertStatus;

  @ApiProperty({ enum: AlertSeverity, required: false })
  @IsEnum(AlertSeverity)
  @IsOptional()
  severity?: AlertSeverity;

  @ApiProperty({ example: 'Updated alert title', required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ example: 'Updated alert description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: {
      additionalInfo: 'Updated additional information',
      relatedDocuments: ['doc-uuid-1', 'doc-uuid-2', 'doc-uuid-3'],
    },
    required: false
  })
  @IsObject()
  @IsOptional()
  details?: Record<string, any>;

  @ApiProperty({
    example: {
      source: 'OFAC SDN List',
      matchScore: 98,
      matchedFields: ['name', 'dateOfBirth', 'address'],
      additionalInfo: {
        listEntryId: '12345',
        listName: 'Specially Designated Nationals List',
      },
    },
    required: false
  })
  @IsObject()
  @IsOptional()
  matchDetails?: {
    source: string;
    matchScore: number;
    matchedFields: string[];
    additionalInfo?: Record<string, any>;
  };

  @ApiProperty({
    example: {
      transactionId: 'TXN-12345',
      amount: 15000,
      currency: 'USD',
      date: '2024-01-01',
      description: 'Updated transaction details',
    },
    required: false
  })
  @IsObject()
  @IsOptional()
  transactionDetails?: {
    transactionId: string;
    amount: number;
    currency: string;
    date: Date;
    description?: string;
  };

  @ApiProperty({
    example: [
      {
        type: 'HIGH_VALUE_TRANSACTION',
        description: 'Transaction amount exceeds threshold',
        severity: 'HIGH',
        impact: 25,
      },
      {
        type: 'UNUSUAL_PATTERN',
        description: 'Unusual transaction pattern detected',
        severity: 'MEDIUM',
        impact: 15,
      },
    ],
    required: false
  })
  @IsArray()
  @IsOptional()
  riskFactors?: Array<{
    type: string;
    description: string;
    severity: AlertSeverity;
    impact: number;
  }>;

  @ApiProperty({ example: 'Resolution notes', required: false })
  @IsString()
  @IsOptional()
  resolutionNotes?: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', required: false })
  @IsString()
  @IsOptional()
  assignedToId?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  isEscalated?: boolean;

  @ApiProperty({ example: 'Escalation reason', required: false })
  @IsString()
  @IsOptional()
  escalationReason?: string;
}
