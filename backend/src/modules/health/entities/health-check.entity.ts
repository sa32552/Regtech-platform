import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum HealthStatus {
  HEALTHY = 'HEALTHY',
  DEGRADED = 'DEGRADED',
  UNHEALTHY = 'UNHEALTHY',
}

export enum HealthCheckType {
  DATABASE = 'DATABASE',
  REDIS = 'REDIS',
  MINIO = 'MINIO',
  AI_SERVICE = 'AI_SERVICE',
  WORKER_QUEUES = 'WORKER_QUEUES',
  EXTERNAL_APIS = 'EXTERNAL_APIS',
}

@Entity('health_checks')
export class HealthCheck {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: HealthCheckType })
  type: HealthCheckType;

  @Column({ type: 'enum', enum: HealthStatus })
  status: HealthStatus;

  @Column({ type: 'int', default: 0 })
  responseTime: number; // in milliseconds

  @Column({ type: 'text', nullable: true })
  message: string;

  @Column({ type: 'json', nullable: true })
  details: Record<string, any>;

  @Column({ type: 'timestamp', nullable: true })
  lastCheckedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastSuccessAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastFailureAt: Date;

  @Column({ type: 'int', default: 0 })
  consecutiveFailures: number;

  @Column({ type: 'int', default: 0 })
  totalChecks: number;

  @Column({ type: 'int', default: 0 })
  successCount: number;

  @Column({ type: 'int', default: 0 })
  failureCount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
