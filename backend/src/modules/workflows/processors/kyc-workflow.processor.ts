import { Processor, Process, OnQueueActive, OnQueueCompleted, OnQueueFailed } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { WorkflowsService } from '../workflows.service';
import { JobType, JobStatus } from '../entities/workflow-job.entity';

@Processor('kyc-workflows')
export class KycWorkflowProcessor {
  private readonly logger = new Logger(KycWorkflowProcessor.name);

  constructor(private readonly workflowsService: WorkflowsService) {}

  @Process(JobType.KYC_VERIFICATION)
  async handleKycVerification(job: Job): Promise<void> {
    this.logger.log(`Processing KYC verification job ${job.id}`);

    // Update job status to processing
    await this.workflowsService.updateStatus(job.id, JobStatus.PROCESSING);

    try {
      // Get KYC record data
      const { kycRecordId, inputData } = job.data;

      // Perform KYC verification logic
      // This would integrate with the AI service for document verification
      // and data validation

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update job status to completed with results
      await this.workflowsService.updateStatus(job.id, JobStatus.COMPLETED);
      await this.workflowsService.update(job.id, {
        outputData: {
          verified: true,
          verificationDate: new Date(),
          notes: 'KYC verification completed successfully',
        },
      });

      this.logger.log(`KYC verification job ${job.id} completed`);
    } catch (error) {
      this.logger.error(`KYC verification job ${job.id} failed: ${error.message}`);

      // Update job status to failed
      await this.workflowsService.updateStatus(job.id, JobStatus.FAILED, error.message);

      throw error;
    }
  }

  @Process(JobType.KYC_REVIEW_REMINDER)
  async handleKycReviewReminder(job: Job): Promise<void> {
    this.logger.log(`Processing KYC review reminder job ${job.id}`);

    await this.workflowsService.updateStatus(job.id, JobStatus.PROCESSING);

    try {
      const { clientId, reviewDate } = job.data;

      // Send reminder notification
      // This would integrate with an email/notification service

      // Update job status to completed
      await this.workflowsService.updateStatus(job.id, JobStatus.COMPLETED);
      await this.workflowsService.update(job.id, {
        outputData: {
          reminderSent: true,
          reminderDate: new Date(),
        },
      });

      this.logger.log(`KYC review reminder job ${job.id} completed`);
    } catch (error) {
      this.logger.error(`KYC review reminder job ${job.id} failed: ${error.message}`);
      await this.workflowsService.updateStatus(job.id, JobStatus.FAILED, error.message);
      throw error;
    }
  }

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.debug(`Processing job ${job.id} of type ${job.name}`);
  }

  @OnQueueCompleted()
  onCompleted(job: Job) {
    this.logger.debug(`Completed job ${job.id} of type ${job.name}`);
  }

  @OnQueueFailed()
  onFailed(job: Job, error: Error) {
    this.logger.error(`Failed job ${job.id} of type ${job.name}: ${error.message}`);
  }
}
