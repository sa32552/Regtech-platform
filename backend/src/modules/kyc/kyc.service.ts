import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from '../clients/entities/client.entity';
import { KycRecord, KycStatus, KycLevel } from './entities/kyc-record.entity';
import { CreateKycRecordDto } from './dto/create-kyc-record.dto';
import { UpdateKycRecordDto } from './dto/update-kyc-record.dto';
import { DocumentsService } from '../documents/documents.service';
import { WorkflowsService } from '../workflows/workflows.service';

@Injectable()
export class KycService {
  constructor(
    @InjectRepository(KycRecord)
    private readonly kycRecordRepository: Repository<KycRecord>,
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
    private readonly documentsService: DocumentsService,
    private readonly workflowsService: WorkflowsService,
  ) {}

  async create(
    clientId: string,
    createKycRecordDto: CreateKycRecordDto,
    submittedById: string,
  ): Promise<KycRecord> {
    // Check if client exists
    const client = await this.clientRepository.findOne({ where: { id: clientId } });
    if (!client) {
      throw new NotFoundException(`Client with ID ${clientId} not found`);
    }

    // Check if there's already a pending KYC record
    const existingPendingRecord = await this.kycRecordRepository.findOne({
      where: {
        clientId,
        status: KycStatus.PENDING,
      },
    });

    if (existingPendingRecord) {
      throw new BadRequestException('A pending KYC record already exists for this client');
    }

    // Create new KYC record
    const newKycRecord = this.kycRecordRepository.create({
      clientId,
      ...createKycRecordDto,
      submittedById,
      submittedAt: new Date(),
      status: KycStatus.IN_PROGRESS,
    });

    // Save the KYC record
    const savedRecord = await this.kycRecordRepository.save(newKycRecord);

    // Start KYC workflow
    await this.workflowsService.startKycWorkflow(savedRecord.id, clientId);

    return savedRecord;
  }

  async findAll(clientId?: string): Promise<KycRecord[]> {
    const query = this.kycRecordRepository.createQueryBuilder('kyc')
      .leftJoinAndSelect('kyc.client', 'client');

    if (clientId) {
      query.andWhere('kyc.clientId = :clientId', { clientId });
    }

    return query.orderBy('kyc.createdAt', 'DESC').getMany();
  }

  async findOne(id: string): Promise<KycRecord> {
    const kycRecord = await this.kycRecordRepository.findOne({
      where: { id },
      relations: ['client'],
    });

    if (!kycRecord) {
      throw new NotFoundException(`KYC record with ID ${id} not found`);
    }

    return kycRecord;
  }

  async update(id: string, updateKycRecordDto: UpdateKycRecordDto): Promise<KycRecord> {
    const kycRecord = await this.findOne(id);
    Object.assign(kycRecord, updateKycRecordDto);
    return this.kycRecordRepository.save(kycRecord);
  }

  async updateStatus(
    id: string,
    status: KycStatus,
    reviewedById: string,
    rejectionReason?: string,
  ): Promise<KycRecord> {
    const kycRecord = await this.findOne(id);

    kycRecord.status = status;
    kycRecord.reviewedById = reviewedById;

    if (status === KycStatus.COMPLETED) {
      kycRecord.completedAt = new Date();

      // Update client status
      await this.clientRepository.update(kycRecord.clientId, {
        status: 'ACTIVE',
      });
    } else if (status === KycStatus.REJECTED && rejectionReason) {
      kycRecord.rejectionReason = rejectionReason;
    }

    return this.kycRecordRepository.save(kycRecord);
  }

  async updateRiskScore(id: string, riskScore: number): Promise<KycRecord> {
    const kycRecord = await this.findOne(id);
    kycRecord.riskScore = riskScore;
    return this.kycRecordRepository.save(kycRecord);
  }

  async addRiskFactor(
    id: string,
    type: string,
    description: string,
    severity: 'LOW' | 'MEDIUM' | 'HIGH',
  ): Promise<KycRecord> {
    const kycRecord = await this.findOne(id);

    if (!kycRecord.riskFactors) {
      kycRecord.riskFactors = [];
    }

    kycRecord.riskFactors.push({ type, description, severity });

    // Recalculate risk score based on risk factors
    const highRiskFactors = kycRecord.riskFactors.filter(f => f.severity === 'HIGH').length;
    const mediumRiskFactors = kycRecord.riskFactors.filter(f => f.severity === 'MEDIUM').length;
    const lowRiskFactors = kycRecord.riskFactors.filter(f => f.severity === 'LOW').length;

    const newRiskScore = Math.min(
      100,
      (highRiskFactors * 30) + (mediumRiskFactors * 15) + (lowRiskFactors * 5)
    );

    kycRecord.riskScore = newRiskScore;

    return this.kycRecordRepository.save(kycRecord);
  }

  async getKycRecordsByStatus(status: KycStatus): Promise<KycRecord[]> {
    return this.kycRecordRepository.find({
      where: { status },
      relations: ['client'],
      order: { createdAt: 'DESC' },
    });
  }

  async getKycRecordsByLevel(level: KycLevel): Promise<KycRecord[]> {
    return this.kycRecordRepository.find({
      where: { level },
      relations: ['client'],
      order: { createdAt: 'DESC' },
    });
  }

  async getKycRecordsDueForReview(): Promise<KycRecord[]> {
    const today = new Date();
    return this.kycRecordRepository
      .createQueryBuilder('kyc')
      .where('kyc.nextReviewDate <= :today', { today })
      .andWhere('kyc.status = :completedStatus', { completedStatus: KycStatus.COMPLETED })
      .getMany();
  }

  async getClientLatestKycRecord(clientId: string): Promise<KycRecord | null> {
    return this.kycRecordRepository.findOne({
      where: { clientId },
      order: { createdAt: 'DESC' },
    });
  }
}
