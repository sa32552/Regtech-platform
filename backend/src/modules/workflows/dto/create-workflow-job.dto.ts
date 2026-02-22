import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsObject, IsOptional, IsDateString } from 'class-validator';
import { JobType, JobPriority } from '../entities/workflow-job.entity';

export class CreateWorkflowJobDto {
  @ApiProperty({ enum: JobType, example: JobType.KYC_VERIFICATION })
  @IsEnum(JobType)
  type: JobType;

  @ApiProperty({ enum: JobPriority, default: JobPriority.NORMAL })
  @IsEnum(JobPriority)
  @IsOptional()
  priority?: JobPriority;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', required: false })
  @IsOptional()
  clientId?: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', required: false })
  @IsOptional()
  kycRecordId?: string;

  @ApiProperty({
    example: {
      kycLevel: 'BASIC',
      clientData: {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1980-01-01',
        nationality: 'French',
        idDocumentType: 'PASSPORT',
        idDocumentNumber: 'AB1234567',
        idDocumentExpiration: '2030-01-01'
      }
    },
    required: false
  })
  @IsObject()
  @IsOptional()
  inputData?: Record<string, any>;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', required: false })
  @IsDateString()
  @IsOptional()
  scheduledAt?: string;

  @ApiProperty({ example: 3, required: false })
  @IsOptional()
  maxRetries?: number;
}
