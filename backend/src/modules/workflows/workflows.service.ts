import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Repository } from 'typeorm';
import { Queue } from 'bull';
import { Client } from '../clients/entities/client.entity';
import { KycRecord } from '../kyc/entities/kyc-record.entity';
import { WorkflowJob, JobStatus, JobType, JobPriority } from './entities/workflow-job.entity';
import { CreateWorkflowJobDto } from './dto/create-workflow-job.dto';
import { UpdateWorkflowJobDto } from './dto/update-workflow-job.dto';

@Injectable()
export class WorkflowsService {
  private readonly logger = new Logger(WorkflowsService.name);

  constructor(
    @InjectRepository(WorkflowJob)
    private readonly workflowJobRepository: Repository<WorkflowJob>,
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
    @InjectRepository(KycRecord)
    private readonly kycRecordRepository: Repository<KycRecord>,
    @InjectQueue('kyc-workflows') private readonly kycWorkflowsQueue: Queue,
    @InjectQueue('aml-workflows') private readonly amlWorkflowsQueue: Queue,
    @InjectQueue('document-workflows') private readonly documentWorkflowsQueue: Queue,
    @InjectQueue('rules-workflows') private readonly rulesWorkflowsQueue: Queue,
  ) {}

  async create(
    createWorkflowJobDto: CreateWorkflowJobDto,
    createdById: string,
  ): Promise<WorkflowJob> {
    // Create workflow job record
    const newJob = this.workflowJobRepository.create({
      ...createWorkflowJobDto,
      createdById,
      status: JobStatus.PENDING,
    });

    const savedJob = await this.workflowJobRepository.save(newJob);

    // Add job to appropriate queue based on type
    await this.addToQueue(savedJob);

    return savedJob;
  }

  async findAll(clientId?: string, status?: JobStatus): Promise<WorkflowJob[]> {
    const query = this.workflowJobRepository.createQueryBuilder('job')
      .leftJoinAndSelect('job.client', 'client')
      .leftJoinAndSelect('job.kycRecord', 'kycRecord');

    if (clientId) {
      query.andWhere('job.clientId = :clientId', { clientId });
    }

    if (status) {
      query.andWhere('job.status = :status', { status });
    }

    return query.orderBy('job.createdAt', 'DESC').getMany();
  }

  async findOne(id: string): Promise<WorkflowJob> {
    const job = await this.workflowJobRepository.findOne({
      where: { id },
      relations: ['client', 'kycRecord'],
    });

    if (!job) {
      throw new Error(`Workflow job with ID ${id} not found`);
    }

    return job;
  }

  async update(id: string, updateWorkflowJobDto: UpdateWorkflowJobDto): Promise<WorkflowJob> {
    const job = await this.findOne(id);
    Object.assign(job, updateWorkflowJobDto);
    return this.workflowJobRepository.save(job);
  }

  async updateStatus(id: string, status: JobStatus, errorMessage?: string): Promise<WorkflowJob> {
    const job = await this.findOne(id);

    job.status = status;

    if (errorMessage) {
      job.errorMessage = errorMessage;
    }

    if (status === JobStatus.PROCESSING && !job.startedAt) {
      job.startedAt = new Date();
    } else if (status === JobStatus.COMPLETED || status === JobStatus.FAILED || status === JobStatus.CANCELLED) {
      job.completedAt = new Date();
      if (job.startedAt) {
        job.duration = Math.floor((job.completedAt.getTime() - job.startedAt.getTime()) / 1000);
      }
    }

    return this.workflowJobRepository.save(job);
  }

  async incrementRetryCount(id: string): Promise<WorkflowJob> {
    const job = await this.findOne(id);
    job.retryCount += 1;
    return this.workflowJobRepository.save(job);
  }

  async remove(id: string): Promise<void> {
    const job = await this.findOne(id);

    // Cancel job in queue if it's still pending
    if (job.status === JobStatus.PENDING) {
      try {
        await this.cancelJobInQueue(job);
      } catch (error) {
        this.logger.error(`Failed to cancel job ${id} in queue: ${error.message}`);
      }
    }

    await this.workflowJobRepository.remove(job);
  }

  // KYC Workflow Methods
  async startKycWorkflow(kycRecordId: string, clientId: string): Promise<WorkflowJob> {
    const kycRecord = await this.kycRecordRepository.findOne({ where: { id: kycRecordId } });
    if (!kycRecord) {
      throw new Error(`KYC record with ID ${kycRecordId} not found`);
    }

    // Create KYC verification job
    const kycVerificationJob = await this.create({
      type: JobType.KYC_VERIFICATION,
      priority: JobPriority.NORMAL,
      clientId,
      kycRecordId,
      inputData: {
        kycLevel: kycRecord.level,
        clientData: kycRecord.personalInfo,
      },
    }, 'system');

    // Create document OCR jobs for all client documents
    // This would be implemented with the DocumentsService
    // await this.createDocumentOcrJobs(clientId, 'system');

    // Create AML screening job
    await this.create({
      type: JobType.AML_SCREENING,
      priority: JobPriority.HIGH,
      clientId,
      kycRecordId,
      inputData: {
        clientData: kycRecord.personalInfo,
      },
    }, 'system');

    return kycVerificationJob;
  }

  // AML Workflow Methods
  async startAmlScreening(clientId: string): Promise<WorkflowJob> {
    const client = await this.clientRepository.findOne({ where: { id: clientId } });
    if (!client) {
      throw new Error(`Client with ID ${clientId} not found`);
    }

    return this.create({
      type: JobType.AML_SCREENING,
      priority: JobPriority.HIGH,
      clientId,
      inputData: {
        clientData: {
          name: client.name,
          email: client.email,
          address: client.address,
          businessName: client.businessName,
          registrationNumber: client.registrationNumber,
          taxId: client.taxId,
        },
      },
    }, 'system');
  }

  // Document Workflow Methods
  async startDocumentOcr(documentId: string, clientId: string): Promise<WorkflowJob> {
    return this.create({
      type: JobType.DOCUMENT_OCR,
      priority: JobPriority.NORMAL,
      clientId,
      inputData: {
        documentId,
      },
    }, 'system');
  }

  // Risk Scoring Methods
  async startRiskScoring(clientId: string): Promise<WorkflowJob> {
    return this.create({
      type: JobType.RISK_SCORING,
      priority: JobPriority.HIGH,
      clientId,
      inputData: {
        clientId,
      },
    }, 'system');
  }

  // Rules Execution Methods
  async executeRules(clientId: string, ruleIds: string[]): Promise<WorkflowJob> {
    return this.create({
      type: JobType.RULES_EXECUTION,
      priority: JobPriority.NORMAL,
      clientId,
      inputData: {
        ruleIds,
      },
    }, 'system');
  }

  // Alert Generation Methods
  async generateAlert(clientId: string, alertData: Record<string, any>): Promise<WorkflowJob> {
    return this.create({
      type: JobType.ALERT_GENERATION,
      priority: JobPriority.HIGH,
      clientId,
      inputData: {
        alertData,
      },
    }, 'system');
  }

  // Scheduled Workflows
  async scheduleKycReviewReminder(clientId: string, reviewDate: Date): Promise<WorkflowJob> {
    return this.create({
      type: JobType.KYC_REVIEW_REMINDER,
      priority: JobPriority.NORMAL,
      clientId,
      scheduledAt: reviewDate,
      inputData: {
        clientId,
        reviewDate,
      },
    }, 'system');
  }

  async scheduleDocumentExpiryCheck(documentId: string, expiryDate: Date): Promise<WorkflowJob> {
    return this.create({
      type: JobType.DOCUMENT_EXPIRY_CHECK,
      priority: JobPriority.NORMAL,
      inputData: {
        documentId,
        expiryDate,
      },
    }, 'system');
  }

  // Queue Management
  private async addToQueue(job: WorkflowJob): Promise<void> {
    const queue = this.getQueueByJobType(job.type);

    const jobOptions = {
      priority: this.getPriorityValue(job.priority),
      attempts: job.maxRetries,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      delay: job.scheduledAt ? job.scheduledAt.getTime() - Date.now() : 0,
    };

    await queue.add(job.id, job, jobOptions);
  }

  private async cancelJobInQueue(job: WorkflowJob): Promise<void> {
    const queue = this.getQueueByJobType(job.type);
    const bullJob = await queue.getJob(job.id);

    if (bullJob) {
      await bullJob.remove();
    }
  }

  private getQueueByJobType(jobType: JobType): Queue {
    switch (jobType) {
      case JobType.KYC_VERIFICATION:
      case JobType.KYC_REVIEW_REMINDER:
        return this.kycWorkflowsQueue;
      case JobType.AML_SCREENING:
      case JobType.RISK_SCORING:
      case JobType.ALERT_GENERATION:
        return this.amlWorkflowsQueue;
      case JobType.DOCUMENT_OCR:
      case JobType.DOCUMENT_VERIFICATION:
      case JobType.DOCUMENT_EXPIRY_CHECK:
        return this.documentWorkflowsQueue;
      case JobType.RULES_EXECUTION:
        return this.rulesWorkflowsQueue;
      default:
        throw new Error(`Unknown job type: ${jobType}`);
    }
  }

  private getPriorityValue(priority: JobPriority): number {
    switch (priority) {
      case JobPriority.LOW:
        return 1;
      case JobPriority.NORMAL:
        return 5;
      case JobPriority.HIGH:
        return 10;
      case JobPriority.CRITICAL:
        return 20;
      default:
        return 5;
    }
  }

  // Statistics
  async getJobStatistics(): Promise<any> {
    const totalJobs = await this.workflowJobRepository.count();
    const pendingJobs = await this.workflowJobRepository.count({ where: { status: JobStatus.PENDING } });
    const processingJobs = await this.workflowJobRepository.count({ where: { status: JobStatus.PROCESSING } });
    const completedJobs = await this.workflowJobRepository.count({ where: { status: JobStatus.COMPLETED } });
    const failedJobs = await this.workflowJobRepository.count({ where: { status: JobStatus.FAILED } });

    return {
      total: totalJobs,
      pending: pendingJobs,
      processing: processingJobs,
      completed: completedJobs,
      failed: failedJobs,
      successRate: totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0,
    };
  }
}
