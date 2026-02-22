import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsObject, IsOptional } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { JobStatus, JobPriority } from '../entities/workflow-job.entity';
import { CreateWorkflowJobDto } from './create-workflow-job.dto';

export class UpdateWorkflowJobDto extends PartialType(CreateWorkflowJobDto) {
  @ApiProperty({ enum: JobStatus, required: false })
  @IsEnum(JobStatus)
  @IsOptional()
  status?: JobStatus;

  @ApiProperty({ enum: JobPriority, required: false })
  @IsEnum(JobPriority)
  @IsOptional()
  priority?: JobPriority;

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

  @ApiProperty({
    example: {
      extractedData: {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1980-01-01',
        nationality: 'French',
        idDocumentType: 'PASSPORT',
        idDocumentNumber: 'AB1234567',
        idDocumentExpiration: '2030-01-01'
      },
      confidence: 0.95
    },
    required: false
  })
  @IsObject()
  @IsOptional()
  outputData?: Record<string, any>;

  @ApiProperty({ example: 'Error message', required: false })
  @IsOptional()
  errorMessage?: string;

  @ApiProperty({ example: 2, required: false })
  @IsOptional()
  retryCount?: number;

  @ApiProperty({ example: 5, required: false })
  @IsOptional()
  maxRetries?: number;
}
