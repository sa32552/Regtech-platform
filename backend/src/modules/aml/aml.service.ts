import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from '../clients/entities/client.entity';
import { AmlAlert, AlertSeverity, AlertStatus, AlertType } from './entities/aml-alert.entity';
import { CreateAmlAlertDto } from './dto/create-aml-alert.dto';
import { UpdateAmlAlertDto } from './dto/update-aml-alert.dto';

@Injectable()
export class AmlService {
  constructor(
    @InjectRepository(AmlAlert)
    private readonly amlAlertRepository: Repository<AmlAlert>,
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) {}

  async create(createAmlAlertDto: CreateAmlAlertDto): Promise<AmlAlert> {
    // Check if client exists
    const client = await this.clientRepository.findOne({ where: { id: createAmlAlertDto.clientId } });
    if (!client) {
      throw new NotFoundException(`Client with ID ${createAmlAlertDto.clientId} not found`);
    }

    // Create new AML alert
    const newAlert = this.amlAlertRepository.create(createAmlAlertDto);

    // Calculate risk score based on severity and risk factors
    const riskScore = this.calculateRiskScore(newAlert.severity, newAlert.riskFactors);
    newAlert.riskScore = riskScore;

    return this.amlAlertRepository.save(newAlert);
  }

  async findAll(
    clientId?: string,
    status?: AlertStatus,
    severity?: AlertSeverity,
    type?: AlertType,
  ): Promise<AmlAlert[]> {
    const query = this.amlAlertRepository.createQueryBuilder('alert')
      .leftJoinAndSelect('alert.client', 'client')
      .leftJoinAndSelect('alert.assignedTo', 'assignedTo')
      .leftJoinAndSelect('alert.resolvedBy', 'resolvedBy')
      .leftJoinAndSelect('alert.acknowledgedBy', 'acknowledgedBy');

    if (clientId) {
      query.andWhere('alert.clientId = :clientId', { clientId });
    }

    if (status) {
      query.andWhere('alert.status = :status', { status });
    }

    if (severity) {
      query.andWhere('alert.severity = :severity', { severity });
    }

    if (type) {
      query.andWhere('alert.type = :type', { type });
    }

    return query.orderBy('alert.createdAt', 'DESC').getMany();
  }

  async findOne(id: string): Promise<AmlAlert> {
    const alert = await this.amlAlertRepository.findOne({
      where: { id },
      relations: ['client', 'assignedTo', 'resolvedBy', 'acknowledgedBy'],
    });

    if (!alert) {
      throw new NotFoundException(`AML alert with ID ${id} not found`);
    }

    return alert;
  }

  async update(id: string, updateAmlAlertDto: UpdateAmlAlertDto): Promise<AmlAlert> {
    const alert = await this.findOne(id);
    Object.assign(alert, updateAmlAlertDto);

    // Recalculate risk score if severity or risk factors changed
    if (updateAmlAlertDto.severity || updateAmlAlertDto.riskFactors) {
      alert.riskScore = this.calculateRiskScore(
        alert.severity,
        alert.riskFactors,
      );
    }

    return this.amlAlertRepository.save(alert);
  }

  async updateStatus(
    id: string,
    status: AlertStatus,
    resolvedById?: string,
    resolutionNotes?: string,
  ): Promise<AmlAlert> {
    const alert = await this.findOne(id);

    alert.status = status;

    if (status === AlertStatus.RESOLVED) {
      alert.resolvedAt = new Date();
      if (resolvedById) {
        alert.resolvedById = resolvedById;
      }
      if (resolutionNotes) {
        alert.resolutionNotes = resolutionNotes;
      }
    }

    return this.amlAlertRepository.save(alert);
  }

  async acknowledgeAlert(id: string, acknowledgedById: string): Promise<AmlAlert> {
    const alert = await this.findOne(id);

    alert.acknowledgedAt = new Date();
    alert.acknowledgedById = acknowledgedById;

    if (alert.status === AlertStatus.NEW) {
      alert.status = AlertStatus.UNDER_REVIEW;
    }

    return this.amlAlertRepository.save(alert);
  }

  async assignAlert(id: string, assignedToId: string): Promise<AmlAlert> {
    const alert = await this.findOne(id);

    alert.assignedToId = assignedToId;

    if (alert.status === AlertStatus.NEW) {
      alert.status = AlertStatus.UNDER_REVIEW;
    }

    return this.amlAlertRepository.save(alert);
  }

  async escalateAlert(
    id: string,
    escalatedToId: string,
    escalationReason: string,
  ): Promise<AmlAlert> {
    const alert = await this.findOne(id);

    alert.isEscalated = true;
    alert.escalatedAt = new Date();
    alert.escalatedToId = escalatedToId;
    alert.escalationReason = escalationReason;
    alert.status = AlertStatus.ESCALATED;

    return this.amlAlertRepository.save(alert);
  }

  async remove(id: string): Promise<void> {
    const alert = await this.findOne(id);
    await this.amlAlertRepository.remove(alert);
  }

  async getAlertsByClient(clientId: string): Promise<AmlAlert[]> {
    return this.amlAlertRepository.find({
      where: { clientId },
      relations: ['client', 'assignedTo', 'resolvedBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async getAlertsByStatus(status: AlertStatus): Promise<AmlAlert[]> {
    return this.amlAlertRepository.find({
      where: { status },
      relations: ['client', 'assignedTo', 'resolvedBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async getAlertsBySeverity(severity: AlertSeverity): Promise<AmlAlert[]> {
    return this.amlAlertRepository.find({
      where: { severity },
      relations: ['client', 'assignedTo', 'resolvedBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async getAlertsByType(type: AlertType): Promise<AmlAlert[]> {
    return this.amlAlertRepository.find({
      where: { type },
      relations: ['client', 'assignedTo', 'resolvedBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async getHighRiskAlerts(): Promise<AmlAlert[]> {
    return this.amlAlertRepository
      .createQueryBuilder('alert')
      .where('alert.severity IN (:...severities)', {
        severities: [AlertSeverity.HIGH, AlertSeverity.CRITICAL],
      })
      .andWhere('alert.status != :resolvedStatus', { resolvedStatus: AlertStatus.RESOLVED })
      .leftJoinAndSelect('alert.client', 'client')
      .leftJoinAndSelect('alert.assignedTo', 'assignedTo')
      .orderBy('alert.createdAt', 'DESC')
      .getMany();
  }

  async getUnassignedAlerts(): Promise<AmlAlert[]> {
    return this.amlAlertRepository
      .createQueryBuilder('alert')
      .where('alert.assignedToId IS NULL')
      .andWhere('alert.status != :resolvedStatus', { resolvedStatus: AlertStatus.RESOLVED })
      .leftJoinAndSelect('alert.client', 'client')
      .orderBy('alert.createdAt', 'DESC')
      .getMany();
  }

  async getAlertStatistics(): Promise<any> {
    const totalAlerts = await this.amlAlertRepository.count();
    const newAlerts = await this.amlAlertRepository.count({ where: { status: AlertStatus.NEW } });
    const underReviewAlerts = await this.amlAlertRepository.count({ where: { status: AlertStatus.UNDER_REVIEW } });
    const resolvedAlerts = await this.amlAlertRepository.count({ where: { status: AlertStatus.RESOLVED } });
    const dismissedAlerts = await this.amlAlertRepository.count({ where: { status: AlertStatus.DISMISSED } });
    const escalatedAlerts = await this.amlAlertRepository.count({ where: { status: AlertStatus.ESCALATED } });

    const highSeverityAlerts = await this.amlAlertRepository.count({ where: { severity: AlertSeverity.HIGH } });
    const criticalSeverityAlerts = await this.amlAlertRepository.count({ where: { severity: AlertSeverity.CRITICAL } });

    const unassignedAlerts = await this.getUnassignedAlerts();

    return {
      total: totalAlerts,
      byStatus: {
        new: newAlerts,
        underReview: underReviewAlerts,
        resolved: resolvedAlerts,
        dismissed: dismissedAlerts,
        escalated: escalatedAlerts,
      },
      bySeverity: {
        low: await this.amlAlertRepository.count({ where: { severity: AlertSeverity.LOW } }),
        medium: await this.amlAlertRepository.count({ where: { severity: AlertSeverity.MEDIUM } }),
        high: highSeverityAlerts,
        critical: criticalSeverityAlerts,
      },
      highPriority: highSeverityAlerts + criticalSeverityAlerts,
      unassigned: unassignedAlerts.length,
      resolutionRate: totalAlerts > 0 ? (resolvedAlerts / totalAlerts) * 100 : 0,
    };
  }

  private calculateRiskScore(
    severity: AlertSeverity,
    riskFactors: Array<{ type: string; description: string; severity: AlertSeverity; impact: number }>,
  ): number {
    let baseScore = 0;

    switch (severity) {
      case AlertSeverity.LOW:
        baseScore = 25;
        break;
      case AlertSeverity.MEDIUM:
        baseScore = 50;
        break;
      case AlertSeverity.HIGH:
        baseScore = 75;
        break;
      case AlertSeverity.CRITICAL:
        baseScore = 90;
        break;
    }

    // Add impact from risk factors
    if (riskFactors && riskFactors.length > 0) {
      const factorsImpact = riskFactors.reduce((total, factor) => total + (factor.impact || 0), 0);
      baseScore += factorsImpact;
    }

    // Ensure score is between 0 and 100
    return Math.min(100, Math.max(0, baseScore));
  }
}
