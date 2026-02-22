import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsObject, IsOptional, IsDateString, IsString, IsArray } from 'class-validator';
import { KycLevel } from '../entities/kyc-record.entity';

export class CreateKycRecordDto {
  @ApiProperty({ enum: KycLevel, default: KycLevel.BASIC })
  @IsEnum(KycLevel)
  @IsOptional()
  level?: KycLevel;

  @ApiProperty({
    example: {
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '1980-01-01',
      nationality: 'French',
      idDocumentType: 'PASSPORT',
      idDocumentNumber: 'AB1234567',
      idDocumentExpiration: '2030-01-01'
    },
    required: false
  })
  @IsObject()
  @IsOptional()
  personalInfo?: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    nationality: string;
    idDocumentType: string;
    idDocumentNumber: string;
    idDocumentExpiration: string;
  };

  @ApiProperty({
    example: {
      street: '123 Main St',
      city: 'Paris',
      state: 'Île-de-France',
      postalCode: '75001',
      country: 'France',
      proofOfAddressDocumentId: 'doc-uuid'
    },
    required: false
  })
  @IsObject()
  @IsOptional()
  addressInfo?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    proofOfAddressDocumentId: string;
  };

  @ApiProperty({
    example: {
      businessName: 'Doe Enterprises',
      registrationNumber: '123456789',
      taxId: 'FR12345678901',
      incorporationDate: '2010-01-01',
      businessAddress: {
        street: '456 Business Ave',
        city: 'Paris',
        state: 'Île-de-France',
        postalCode: '75002',
        country: 'France'
      }
    },
    required: false
  })
  @IsObject()
  @IsOptional()
  businessInfo?: {
    businessName: string;
    registrationNumber: string;
    taxId: string;
    incorporationDate: string;
    businessAddress: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
  };

  @ApiProperty({
    example: [
      {
        name: 'Jane Doe',
        percentage: 75,
        idDocumentType: 'PASSPORT',
        idDocumentNumber: 'CD7654321',
        idDocumentExpiration: '2028-01-01'
      }
    ],
    required: false
  })
  @IsArray()
  @IsOptional()
  beneficialOwners?: Array<{
    name: string;
    percentage: number;
    idDocumentType: string;
    idDocumentNumber: string;
    idDocumentExpiration: string;
  }>;

  @ApiProperty({ example: 'Additional notes about the KYC record', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}
