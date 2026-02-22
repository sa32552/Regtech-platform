import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsEnum, IsOptional, IsObject, IsDateString, IsNumber, Min, Max } from 'class-validator';
import { ClientType, ClientStatus, RiskLevel } from '../entities/client.entity';

export class CreateClientDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+33612345678', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ enum: ClientType, default: ClientType.INDIVIDUAL })
  @IsEnum(ClientType)
  @IsOptional()
  type?: ClientType;

  @ApiProperty({ enum: ClientStatus, default: ClientStatus.PENDING })
  @IsEnum(ClientStatus)
  @IsOptional()
  status?: ClientStatus;

  @ApiProperty({ enum: RiskLevel, default: RiskLevel.MEDIUM })
  @IsEnum(RiskLevel)
  @IsOptional()
  riskLevel?: RiskLevel;

  @ApiProperty({ example: 'Doe Enterprises', required: false })
  @IsString()
  @IsOptional()
  businessName?: string;

  @ApiProperty({ example: '123456789', required: false })
  @IsString()
  @IsOptional()
  registrationNumber?: string;

  @ApiProperty({ example: 'FR12345678901', required: false })
  @IsString()
  @IsOptional()
  taxId?: string;

  @ApiProperty({
    example: {
      street: '123 Main St',
      city: 'Paris',
      state: 'Île-de-France',
      postalCode: '75001',
      country: 'France'
    },
    required: false
  })
  @IsObject()
  @IsOptional()
  address?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };

  @ApiProperty({ example: '1980-01-01', required: false })
  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @ApiProperty({ example: 'French', required: false })
  @IsString()
  @IsOptional()
  nationality?: string;

  @ApiProperty({ example: 'PASSPORT', required: false })
  @IsString()
  @IsOptional()
  idDocumentType?: string;

  @ApiProperty({ example: 'AB1234567', required: false })
  @IsString()
  @IsOptional()
  idDocumentNumber?: string;

  @ApiProperty({ example: '2030-01-01', required: false })
  @IsDateString()
  @IsOptional()
  idDocumentExpiration?: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', required: false })
  @IsString()
  @IsOptional()
  assignedToId?: string;
}
