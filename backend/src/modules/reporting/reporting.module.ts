import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportingController } from './reporting.controller';
import { ReportingService } from './reporting.service';
import { Client } from '../clients/entities/client.entity';
import { KycRecord } from '../kyc/entities/kyc-record.entity';
import { AmlAlert } from '../aml/entities/aml-alert.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Client,
      KycRecord,
      AmlAlert,
    ]),
  ],
  controllers: [ReportingController],
  providers: [ReportingService],
  exports: [ReportingService],
})
export class ReportingModule {}
