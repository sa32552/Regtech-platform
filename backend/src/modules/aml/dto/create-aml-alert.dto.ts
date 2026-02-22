import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsObject, IsOptional, IsArray, IsNumber, IsDateString } from 'class-validator';
import { AlertSeverity, AlertStatus, AlertType } from '../entities/aml-alert.entity';

export class CreateAmlAlertDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsString()
  clientId: string;

  @ApiProperty({ enum: AlertType, example: AlertType.SANCTIONS_MATCH })
  @IsEnum(AlertType)
  type: AlertType;

  @ApiProperty({ enum: AlertSeverity, example: AlertSeverity.HIGH })
  @IsEnum(AlertSeverity)
  severity: AlertSeverity;

  @ApiProperty({ example: 'Potential sanctions match detected' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Client name matches an entry on the OFAC SDN list' })
  @IsString()
  description: string;

  @ApiProperty({
    example: {
      additionalInfo: 'Matched on name and date of birth',
      relatedDocuments: ['doc-uuid-1', 'doc-uuid-2'],
    },
    required: false
  })
  @IsObject()
  @IsOptional()
  details?: Record<string, any>;

  @ApiProperty({
    example: {
      source: 'OFAC SDN List',
      matchScore: 95,
      matchedFields: ['name', 'dateOfBirth'],
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
      amount: 10000,
      currency: 'USD',
      date: '2024-01-01',
      description: 'Large cash deposit',
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
        impact: 20,
      },
      {
        type: 'UNUSUAL_PATTERN',
        description: 'Unusual transaction pattern detected',
        severity: 'MEDIUM',
        impact: 10,
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

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', required: false })
  @IsString()
  @IsOptional()
  assignedToId?: string;
}
