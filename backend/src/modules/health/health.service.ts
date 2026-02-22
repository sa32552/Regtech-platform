import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { HealthCheck, HealthStatus, HealthCheckType } from './entities/health-check.entity';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import * as Minio from 'minio';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  private minioClient: Minio.Client;

  constructor(
    @InjectRepository(HealthCheck)
    private readonly healthCheckRepository: Repository<HealthCheck>,
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
    @InjectQueue('kyc-workflows') private readonly kycWorkflowsQueue: Queue,
    @InjectQueue('aml-workflows') private readonly amlWorkflowsQueue: Queue,
    @InjectQueue('document-workflows') private readonly documentWorkflowsQueue: Queue,
    @InjectQueue('rules-workflows') private readonly rulesWorkflowsQueue: Queue,
    private readonly httpService: HttpService,
  ) {
    // Initialize MinIO client
    this.minioClient = new Minio.Client({
      endPoint: this.configService.get<string>('MINIO_ENDPOINT'),
      port: parseInt(this.configService.get<string>('MINIO_PORT')),
      useSSL: this.configService.get<boolean>('MINIO_USE_SSL') || false,
      accessKey: this.configService.get<string>('MINIO_ACCESS_KEY'),
      secretKey: this.configService.get<string>('MINIO_SECRET_KEY'),
    });
  }

  async checkAll(): Promise<any> {
    const startTime = Date.now();

    const checks = await Promise.all([
      this.checkDatabase(),
      this.checkRedis(),
      this.checkMinio(),
      this.checkAiService(),
      this.checkWorkerQueues(),
      this.checkExternalApis(),
    ]);

    const overallStatus = this.calculateOverallStatus(checks);
    const responseTime = Date.now() - startTime;

    return {
      status: overallStatus,
      timestamp: new Date(),
      responseTime,
      checks: {
        database: checks[0],
        redis: checks[1],
        minio: checks[2],
        aiService: checks[3],
        workerQueues: checks[4],
        externalApis: checks[5],
      },
    };
  }

  async checkDatabase(): Promise<any> {
    const startTime = Date.now();
    const healthCheck = await this.getOrCreateHealthCheck(HealthCheckType.DATABASE);

    try {
      // Check database connection
      await this.dataSource.query('SELECT 1');

      const responseTime = Date.now() - startTime;

      // Update health check
      healthCheck.status = HealthStatus.HEALTHY;
      healthCheck.responseTime = responseTime;
      healthCheck.message = 'Database connection successful';
      healthCheck.lastCheckedAt = new Date();
      healthCheck.lastSuccessAt = new Date();
      healthCheck.consecutiveFailures = 0;
      healthCheck.totalChecks++;
      healthCheck.successCount++;

      await this.healthCheckRepository.save(healthCheck);

      return {
        type: HealthCheckType.DATABASE,
        status: HealthStatus.HEALTHY,
        responseTime,
        message: 'Database connection successful',
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;

      // Update health check
      healthCheck.status = HealthStatus.UNHEALTHY;
      healthCheck.responseTime = responseTime;
      healthCheck.message = `Database connection failed: ${error.message}`;
      healthCheck.lastCheckedAt = new Date();
      healthCheck.lastFailureAt = new Date();
      healthCheck.consecutiveFailures++;
      healthCheck.totalChecks++;
      healthCheck.failureCount++;

      await this.healthCheckRepository.save(healthCheck);

      this.logger.error(`Database health check failed: ${error.message}`);

      return {
        type: HealthCheckType.DATABASE,
        status: HealthStatus.UNHEALTHY,
        responseTime,
        message: `Database connection failed: ${error.message}`,
      };
    }
  }

  async checkRedis(): Promise<any> {
    const startTime = Date.now();
    const healthCheck = await this.getOrCreateHealthCheck(HealthCheckType.REDIS);

    try {
      // Check Redis connection through BullMQ
      const client = await this.kycWorkflowsQueue.client;
      await client.ping();

      const responseTime = Date.now() - startTime;

      // Update health check
      healthCheck.status = HealthStatus.HEALTHY;
      healthCheck.responseTime = responseTime;
      healthCheck.message = 'Redis connection successful';
      healthCheck.lastCheckedAt = new Date();
      healthCheck.lastSuccessAt = new Date();
      healthCheck.consecutiveFailures = 0;
      healthCheck.totalChecks++;
      healthCheck.successCount++;

      await this.healthCheckRepository.save(healthCheck);

      return {
        type: HealthCheckType.REDIS,
        status: HealthStatus.HEALTHY,
        responseTime,
        message: 'Redis connection successful',
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;

      // Update health check
      healthCheck.status = HealthStatus.UNHEALTHY;
      healthCheck.responseTime = responseTime;
      healthCheck.message = `Redis connection failed: ${error.message}`;
      healthCheck.lastCheckedAt = new Date();
      healthCheck.lastFailureAt = new Date();
      healthCheck.consecutiveFailures++;
      healthCheck.totalChecks++;
      healthCheck.failureCount++;

      await this.healthCheckRepository.save(healthCheck);

      this.logger.error(`Redis health check failed: ${error.message}`);

      return {
        type: HealthCheckType.REDIS,
        status: HealthStatus.UNHEALTHY,
        responseTime,
        message: `Redis connection failed: ${error.message}`,
      };
    }
  }

  async checkMinio(): Promise<any> {
    const startTime = Date.now();
    const healthCheck = await this.getOrCreateHealthCheck(HealthCheckType.MINIO);

    try {
      // Check MinIO connection
      await this.minioClient.listBuckets();

      const responseTime = Date.now() - startTime;

      // Update health check
      healthCheck.status = HealthStatus.HEALTHY;
      healthCheck.responseTime = responseTime;
      healthCheck.message = 'MinIO connection successful';
      healthCheck.lastCheckedAt = new Date();
      healthCheck.lastSuccessAt = new Date();
      healthCheck.consecutiveFailures = 0;
      healthCheck.totalChecks++;
      healthCheck.successCount++;

      await this.healthCheckRepository.save(healthCheck);

      return {
        type: HealthCheckType.MINIO,
        status: HealthStatus.HEALTHY,
        responseTime,
        message: 'MinIO connection successful',
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;

      // Update health check
      healthCheck.status = HealthStatus.UNHEALTHY;
      healthCheck.responseTime = responseTime;
      healthCheck.message = `MinIO connection failed: ${error.message}`;
      healthCheck.lastCheckedAt = new Date();
      healthCheck.lastFailureAt = new Date();
      healthCheck.consecutiveFailures++;
      healthCheck.totalChecks++;
      healthCheck.failureCount++;

      await this.healthCheckRepository.save(healthCheck);

      this.logger.error(`MinIO health check failed: ${error.message}`);

      return {
        type: HealthCheckType.MINIO,
        status: HealthStatus.UNHEALTHY,
        responseTime,
        message: `MinIO connection failed: ${error.message}`,
      };
    }
  }

  async checkAiService(): Promise<any> {
    const startTime = Date.now();
    const healthCheck = await this.getOrCreateHealthCheck(HealthCheckType.AI_SERVICE);

    try {
      // Check AI service health
      const aiServiceUrl = this.configService.get<string>('AI_SERVICE_URL');
      const response = await this.httpService.axiosRef.get(`${aiServiceUrl}/health`, {
        timeout: 5000,
      });

      const responseTime = Date.now() - startTime;

      if (response.status === 200) {
        // Update health check
        healthCheck.status = HealthStatus.HEALTHY;
        healthCheck.responseTime = responseTime;
        healthCheck.message = 'AI service connection successful';
        healthCheck.lastCheckedAt = new Date();
        healthCheck.lastSuccessAt = new Date();
        healthCheck.consecutiveFailures = 0;
        healthCheck.totalChecks++;
        healthCheck.successCount++;

        await this.healthCheckRepository.save(healthCheck);

        return {
          type: HealthCheckType.AI_SERVICE,
          status: HealthStatus.HEALTHY,
          responseTime,
          message: 'AI service connection successful',
          details: response.data,
        };
      } else {
        throw new Error(`AI service returned status ${response.status}`);
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;

      // Update health check
      healthCheck.status = HealthStatus.DEGRADED;
      healthCheck.responseTime = responseTime;
      healthCheck.message = `AI service connection failed: ${error.message}`;
      healthCheck.lastCheckedAt = new Date();
      healthCheck.lastFailureAt = new Date();
      healthCheck.consecutiveFailures++;
      healthCheck.totalChecks++;
      healthCheck.failureCount++;

      await this.healthCheckRepository.save(healthCheck);

      this.logger.warn(`AI service health check failed: ${error.message}`);

      return {
        type: HealthCheckType.AI_SERVICE,
        status: HealthStatus.DEGRADED,
        responseTime,
        message: `AI service connection failed: ${error.message}`,
      };
    }
  }

  async checkWorkerQueues(): Promise<any> {
    const startTime = Date.now();
    const healthCheck = await this.getOrCreateHealthCheck(HealthCheckType.WORKER_QUEUES);

    try {
      // Check all worker queues
      const queues = [
        { name: 'kyc-workflows', queue: this.kycWorkflowsQueue },
        { name: 'aml-workflows', queue: this.amlWorkflowsQueue },
        { name: 'document-workflows', queue: this.documentWorkflowsQueue },
        { name: 'rules-workflows', queue: this.rulesWorkflowsQueue },
      ];

      const queueStats = [];
      let allHealthy = true;

      for (const { name, queue } of queues) {
        const [waiting, active, completed, failed] = await Promise.all([
          queue.getWaitingCount(),
          queue.getActiveCount(),
          queue.getCompletedCount(),
          queue.getFailedCount(),
        ]);

        queueStats.push({
          name,
          waiting,
          active,
          completed,
          failed,
        });

        if (failed > 100) {
          allHealthy = false;
        }
      }

      const responseTime = Date.now() - startTime;

      // Update health check
      healthCheck.status = allHealthy ? HealthStatus.HEALTHY : HealthStatus.DEGRADED;
      healthCheck.responseTime = responseTime;
      healthCheck.message = allHealthy ? 'All worker queues healthy' : 'Some worker queues have high failure rates';
      healthCheck.details = { queues: queueStats };
      healthCheck.lastCheckedAt = new Date();
      healthCheck.lastSuccessAt = new Date();
      healthCheck.consecutiveFailures = 0;
      healthCheck.totalChecks++;
      healthCheck.successCount++;

      await this.healthCheckRepository.save(healthCheck);

      return {
        type: HealthCheckType.WORKER_QUEUES,
        status: allHealthy ? HealthStatus.HEALTHY : HealthStatus.DEGRADED,
        responseTime,
        message: allHealthy ? 'All worker queues healthy' : 'Some worker queues have high failure rates',
        details: { queues: queueStats },
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;

      // Update health check
      healthCheck.status = HealthStatus.UNHEALTHY;
      healthCheck.responseTime = responseTime;
      healthCheck.message = `Worker queues check failed: ${error.message}`;
      healthCheck.lastCheckedAt = new Date();
      healthCheck.lastFailureAt = new Date();
      healthCheck.consecutiveFailures++;
      healthCheck.totalChecks++;
      healthCheck.failureCount++;

      await this.healthCheckRepository.save(healthCheck);

      this.logger.error(`Worker queues health check failed: ${error.message}`);

      return {
        type: HealthCheckType.WORKER_QUEUES,
        status: HealthStatus.UNHEALTHY,
        responseTime,
        message: `Worker queues check failed: ${error.message}`,
      };
    }
  }

  async checkExternalApis(): Promise<any> {
    const startTime = Date.now();
    const healthCheck = await this.getOrCreateHealthCheck(HealthCheckType.EXTERNAL_APIS);

    try {
      // Check external APIs (this would be configured based on actual external services)
      const externalApis = [
        {
          name: 'Sanctions List API',
          url: 'https://api.example.com/sanctions/health',
          timeout: 5000,
        },
        {
          name: 'PEP Database API',
          url: 'https://api.example.com/pep/health',
          timeout: 5000,
        },
      ];

      const apiResults = [];
      let allHealthy = true;

      for (const api of externalApis) {
        try {
          const response = await this.httpService.axiosRef.get(api.url, {
            timeout: api.timeout,
          });

          apiResults.push({
            name: api.name,
            status: 'HEALTHY',
            responseTime: response.headers['x-response-time'] || 0,
          });
        } catch (error) {
          allHealthy = false;
          apiResults.push({
            name: api.name,
            status: 'UNHEALTHY',
            error: error.message,
          });
        }
      }

      const responseTime = Date.now() - startTime;

      // Update health check
      healthCheck.status = allHealthy ? HealthStatus.HEALTHY : HealthStatus.DEGRADED;
      healthCheck.responseTime = responseTime;
      healthCheck.message = allHealthy ? 'All external APIs healthy' : 'Some external APIs are unhealthy';
      healthCheck.details = { apis: apiResults };
      healthCheck.lastCheckedAt = new Date();
      healthCheck.lastSuccessAt = new Date();
      healthCheck.consecutiveFailures = 0;
      healthCheck.totalChecks++;
      healthCheck.successCount++;

      await this.healthCheckRepository.save(healthCheck);

      return {
        type: HealthCheckType.EXTERNAL_APIS,
        status: allHealthy ? HealthStatus.HEALTHY : HealthStatus.DEGRADED,
        responseTime,
        message: allHealthy ? 'All external APIs healthy' : 'Some external APIs are unhealthy',
        details: { apis: apiResults },
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;

      // Update health check
      healthCheck.status = HealthStatus.DEGRADED;
      healthCheck.responseTime = responseTime;
      healthCheck.message = `External APIs check failed: ${error.message}`;
      healthCheck.lastCheckedAt = new Date();
      healthCheck.lastFailureAt = new Date();
      healthCheck.consecutiveFailures++;
      healthCheck.totalChecks++;
      healthCheck.failureCount++;

      await this.healthCheckRepository.save(healthCheck);

      this.logger.warn(`External APIs health check failed: ${error.message}`);

      return {
        type: HealthCheckType.EXTERNAL_APIS,
        status: HealthStatus.DEGRADED,
        responseTime,
        message: `External APIs check failed: ${error.message}`,
      };
    }
  }

  async getHealthHistory(
    type?: HealthCheckType,
    startDate?: Date,
    endDate?: Date,
    limit: number = 100,
  ): Promise<HealthCheck[]> {
    const query = this.healthCheckRepository.createQueryBuilder('healthCheck')
      .orderBy('healthCheck.createdAt', 'DESC')
      .limit(limit);

    if (type) {
      query.andWhere('healthCheck.type = :type', { type });
    }

    if (startDate) {
      query.andWhere('healthCheck.createdAt >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('healthCheck.createdAt <= :endDate', { endDate });
    }

    return query.getMany();
  }

  async getHealthStatistics(): Promise<any> {
    const totalChecks = await this.healthCheckRepository.count();

    const checksByType = {};
    for (const type of Object.values(HealthCheckType)) {
      checksByType[type] = await this.healthCheckRepository.count({ where: { type } });
    }

    const checksByStatus = {};
    for (const status of Object.values(HealthStatus)) {
      checksByStatus[status] = await this.healthCheckRepository.count({ where: { status } });
    }

    return {
      total: totalChecks,
      byType: checksByType,
      byStatus: checksByStatus,
    };
  }

  private async getOrCreateHealthCheck(type: HealthCheckType): Promise<HealthCheck> {
    let healthCheck = await this.healthCheckRepository.findOne({
      where: { type },
      order: { createdAt: 'DESC' },
    });

    if (!healthCheck) {
      healthCheck = this.healthCheckRepository.create({
        type,
        status: HealthStatus.HEALTHY,
        responseTime: 0,
        message: 'Initial health check',
        totalChecks: 0,
        successCount: 0,
        failureCount: 0,
        consecutiveFailures: 0,
      });
    }

    return healthCheck;
  }

  private calculateOverallStatus(checks: any[]): HealthStatus {
    const hasUnhealthy = checks.some(check => check.status === HealthStatus.UNHEALTHY);
    const hasDegraded = checks.some(check => check.status === HealthStatus.DEGRADED);

    if (hasUnhealthy) {
      return HealthStatus.UNHEALTHY;
    } else if (hasDegraded) {
      return HealthStatus.DEGRADED;
    } else {
      return HealthStatus.HEALTHY;
    }
  }
}
