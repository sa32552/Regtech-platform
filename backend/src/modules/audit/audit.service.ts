import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog, AuditAction, AuditEntityType } from './entities/audit-log.entity';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async create(createAuditLogDto: CreateAuditLogDto): Promise<AuditLog> {
    const auditLog = this.auditLogRepository.create(createAuditLogDto);
    return this.auditLogRepository.save(auditLog);
  }

  async findAll(
    userId?: string,
    clientId?: string,
    action?: AuditAction,
    entityType?: AuditEntityType,
    entityId?: string,
    startDate?: Date,
    endDate?: Date,
    limit: number = 100,
    offset: number = 0,
  ): Promise<AuditLog[]> {
    const query = this.auditLogRepository.createQueryBuilder('audit')
      .leftJoinAndSelect('audit.user', 'user')
      .leftJoinAndSelect('audit.client', 'client')
      .orderBy('audit.createdAt', 'DESC')
      .limit(limit)
      .offset(offset);

    if (userId) {
      query.andWhere('audit.userId = :userId', { userId });
    }

    if (clientId) {
      query.andWhere('audit.clientId = :clientId', { clientId });
    }

    if (action) {
      query.andWhere('audit.action = :action', { action });
    }

    if (entityType) {
      query.andWhere('audit.entityType = :entityType', { entityType });
    }

    if (entityId) {
      query.andWhere('audit.entityId = :entityId', { entityId });
    }

    if (startDate) {
      query.andWhere('audit.createdAt >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('audit.createdAt <= :endDate', { endDate });
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<AuditLog> {
    const auditLog = await this.auditLogRepository.findOne({
      where: { id },
      relations: ['user', 'client'],
    });

    if (!auditLog) {
      throw new Error(`Audit log with ID ${id} not found`);
    }

    return auditLog;
  }

  async findByEntity(
    entityType: AuditEntityType,
    entityId: string,
    limit: number = 100,
  ): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { entityType, entityId },
      relations: ['user', 'client'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async findByUser(
    userId: string,
    startDate?: Date,
    endDate?: Date,
    limit: number = 100,
  ): Promise<AuditLog[]> {
    const query = this.auditLogRepository.createQueryBuilder('audit')
      .where('audit.userId = :userId', { userId })
      .leftJoinAndSelect('audit.user', 'user')
      .leftJoinAndSelect('audit.client', 'client')
      .orderBy('audit.createdAt', 'DESC')
      .limit(limit);

    if (startDate) {
      query.andWhere('audit.createdAt >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('audit.createdAt <= :endDate', { endDate });
    }

    return query.getMany();
  }

  async findByClient(
    clientId: string,
    startDate?: Date,
    endDate?: Date,
    limit: number = 100,
  ): Promise<AuditLog[]> {
    const query = this.auditLogRepository.createQueryBuilder('audit')
      .where('audit.clientId = :clientId', { clientId })
      .leftJoinAndSelect('audit.user', 'user')
      .leftJoinAndSelect('audit.client', 'client')
      .orderBy('audit.createdAt', 'DESC')
      .limit(limit);

    if (startDate) {
      query.andWhere('audit.createdAt >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('audit.createdAt <= :endDate', { endDate });
    }

    return query.getMany();
  }

  async findByAction(
    action: AuditAction,
    startDate?: Date,
    endDate?: Date,
    limit: number = 100,
  ): Promise<AuditLog[]> {
    const query = this.auditLogRepository.createQueryBuilder('audit')
      .where('audit.action = :action', { action })
      .leftJoinAndSelect('audit.user', 'user')
      .leftJoinAndSelect('audit.client', 'client')
      .orderBy('audit.createdAt', 'DESC')
      .limit(limit);

    if (startDate) {
      query.andWhere('audit.createdAt >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('audit.createdAt <= :endDate', { endDate });
    }

    return query.getMany();
  }

  async getAuditStatistics(
    startDate?: Date,
    endDate?: Date,
  ): Promise<any> {
    const query = this.auditLogRepository.createQueryBuilder('audit');

    if (startDate) {
      query.andWhere('audit.createdAt >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('audit.createdAt <= :endDate', { endDate });
    }

    const totalLogs = await query.getCount();
    const successfulLogs = await query.clone().andWhere('audit.isSuccessful = true').getCount();
    const failedLogs = await query.clone().andWhere('audit.isSuccessful = false').getCount();

    // Get logs by action type
    const logsByAction = {};
    for (const action of Object.values(AuditAction)) {
      logsByAction[action] = await query.clone()
        .andWhere('audit.action = :action', { action })
        .getCount();
    }

    // Get logs by entity type
    const logsByEntityType = {};
    for (const entityType of Object.values(AuditEntityType)) {
      logsByEntityType[entityType] = await query.clone()
        .andWhere('audit.entityType = :entityType', { entityType })
        .getCount();
    }

    // Get top users by activity
    const topUsers = await this.auditLogRepository
      .createQueryBuilder('audit')
      .select('audit.userId', 'userId')
      .addSelect('COUNT(*)', 'count')
      .where('audit.createdAt >= :startDate', { startDate: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) })
      .groupBy('audit.userId')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    return {
      total: totalLogs,
      successful: successfulLogs,
      failed: failedLogs,
      successRate: totalLogs > 0 ? (successfulLogs / totalLogs) * 100 : 0,
      byAction: logsByAction,
      byEntityType: logsByEntityType,
      topUsers,
    };
  }

  async exportAuditLogs(
    filters: {
      userId?: string;
      clientId?: string;
      action?: AuditAction;
      entityType?: AuditEntityType;
      entityId?: string;
      startDate?: Date;
      endDate?: Date;
    },
    format: 'CSV' | 'JSON' = 'CSV',
  ): Promise<any> {
    const auditLogs = await this.findAll(
      filters.userId,
      filters.clientId,
      filters.action,
      filters.entityType,
      filters.entityId,
      filters.startDate,
      filters.endDate,
      10000, // Export limit
      0,
    );

    if (format === 'CSV') {
      // Convert to CSV format
      const headers = [
        'ID',
        'Action',
        'Entity Type',
        'Entity ID',
        'User ID',
        'Client ID',
        'Description',
        'IP Address',
        'Created At',
        'Is Successful',
      ];

      const rows = auditLogs.map(log => [
        log.id,
        log.action,
        log.entityType,
        log.entityId,
        log.userId,
        log.clientId,
        log.description,
        log.ipAddress,
        log.createdAt.toISOString(),
        log.isSuccessful,
      ]);

      return {
        format: 'CSV',
        filename: `audit-logs-${Date.now()}.csv`,
        data: [headers, ...rows],
      };
    } else {
      // Return as JSON
      return {
        format: 'JSON',
        filename: `audit-logs-${Date.now()}.json`,
        data: auditLogs,
      };
    }
  }
}
