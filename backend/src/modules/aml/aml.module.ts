import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AmlService } from './aml.service';
import { AmlController } from './aml.controller';
import { AmlAlert } from './entities/aml-alert.entity';
import { Client } from '../clients/entities/client.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AmlAlert, Client, User])],
  controllers: [AmlController],
  providers: [AmlService],
  exports: [AmlService],
})
export class AmlModule {}
