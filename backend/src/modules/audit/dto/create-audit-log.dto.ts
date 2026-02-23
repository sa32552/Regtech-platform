import { AuditAction, AuditEntityType } from '../entities/audit-log.entity';

export class CreateAuditLogDto {
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  userId: string;
  clientId?: string;
  description: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
  isSuccessful?: boolean;
  errorMessage?: string;
}
