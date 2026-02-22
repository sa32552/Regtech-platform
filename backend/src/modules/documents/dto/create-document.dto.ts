import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsDateString } from 'class-validator';
import { DocumentType } from '../entities/kyc-document.entity';

export class CreateDocumentDto {
  @ApiProperty({ enum: DocumentType, example: DocumentType.PASSPORT })
  @IsEnum(DocumentType)
  type: DocumentType;

  @ApiProperty({ example: '2030-01-01', required: false })
  @IsDateString()
  @IsOptional()
  expirationDate?: string;

  @ApiProperty({ example: 'Additional notes about the document', required: false })
  @IsOptional()
  notes?: string;
}
