import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsDateString, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { DocumentType, DocumentStatus } from '../entities/kyc-document.entity';
import { CreateDocumentDto } from './create-document.dto';

export class UpdateDocumentDto extends PartialType(CreateDocumentDto) {
  @ApiProperty({ enum: DocumentType, required: false })
  @IsEnum(DocumentType)
  @IsOptional()
  type?: DocumentType;

  @ApiProperty({ enum: DocumentStatus, required: false })
  @IsEnum(DocumentStatus)
  @IsOptional()
  status?: DocumentStatus;

  @ApiProperty({ example: '2030-01-01', required: false })
  @IsDateString()
  @IsOptional()
  expirationDate?: string;

  @ApiProperty({ example: 'Additional notes about the document', required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ example: 'Reason for rejection', required: false })
  @IsString()
  @IsOptional()
  rejectionReason?: string;
}
