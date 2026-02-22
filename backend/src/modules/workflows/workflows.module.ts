import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkflowsService } from './workflows.service';
import { WorkflowsController } from './workflows.controller';
import { WorkflowJob } from './entities/workflow-job.entity';
import { Client } from '../clients/entities/client.entity';
import { KycRecord } from '../kyc/entities/kyc-record.entity';
import { KycWorkflowProcessor } from './processors/kyc-workflow.processor';
import { AmlWorkflowProcessor } from './processors/aml-workflow.processor';
import { DocumentWorkflowProcessor } from './processors/document-workflow.processor';
import { RulesWorkflowProcessor } from './processors/rules-workflow.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkflowJob, Client, KycRecord]),
    BullModule.registerQueue(
      {
        name: 'kyc-workflows',
        defaultJobOptions: {
          removeOnComplete: 10,
          removeOnFail: 5,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        },
      },
      {
        name: 'aml-workflows',
        defaultJobOptions: {
          removeOnComplete: 10,
          removeOnFail: 5,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        },
      },
      {
        name: 'document-workflows',
        defaultJobOptions: {
          removeOnComplete: 10,
          removeOnFail: 5,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        },
      },
      {
        name: 'rules-workflows',
        defaultJobOptions: {
          removeOnComplete: 10,
          removeOnFail: 5,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        },
      },
    ),
  ],
  controllers: [WorkflowsController],
  providers: [
    WorkflowsService,
    KycWorkflowProcessor,
    AmlWorkflowProcessor,
    DocumentWorkflowProcessor,
    RulesWorkflowProcessor,
  ],
  exports: [WorkflowsService],
})
export class WorkflowsModule {}
