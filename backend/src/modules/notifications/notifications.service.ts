import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType, NotificationStatus } from './entities/notification.entity';
import { NotificationsGateway } from './notifications.gateway';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  /**
   * Créer et envoyer une notification
   */
  async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    const notification = this.notificationRepository.create({
      ...createNotificationDto,
      status: NotificationStatus.SENT,
    });

    const savedNotification = await this.notificationRepository.save(notification);

    // Envoyer la notification en temps réel si l'utilisateur est connecté
    await this.notificationsGateway.sendNotificationToUser(
      createNotificationDto.userId,
      {
        type: createNotificationDto.type,
        title: createNotificationDto.title,
        message: createNotificationDto.message,
        data: createNotificationDto.data,
        timestamp: new Date(),
      },
    );

    return savedNotification;
  }

  /**
   * Trouver toutes les notifications d'un utilisateur
   */
  async findByUser(
    userId: string,
    status?: NotificationStatus,
    limit: number = 50,
    offset: number = 0,
  ): Promise<Notification[]> {
    const query = this.notificationRepository
      .createQueryBuilder('notification')
      .where('notification.userId = :userId', { userId })
      .orderBy('notification.createdAt', 'DESC')
      .limit(limit)
      .offset(offset);

    if (status) {
      query.andWhere('notification.status = :status', { status });
    }

    return query.getMany();
  }

  /**
   * Trouver une notification par ID
   */
  async findOne(id: string): Promise<Notification> {
    return this.notificationRepository.findOne({ where: { id } });
  }

  /**
   * Marquer une notification comme lue
   */
  async markAsRead(id: string, userId: string): Promise<Notification> {
    const notification = await this.findOne(id);

    if (!notification) {
      throw new Error(`Notification with ID ${id} not found`);
    }

    if (notification.userId !== userId) {
      throw new Error('Unauthorized');
    }

    notification.status = NotificationStatus.READ;
    notification.readAt = new Date();

    return this.notificationRepository.save(notification);
  }

  /**
   * Marquer toutes les notifications d'un utilisateur comme lues
   */
  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository
      .createQueryBuilder()
      .update(Notification)
      .set({ status: NotificationStatus.READ, readAt: new Date() })
      .where('userId = :userId', { userId })
      .andWhere('status = :status', { status: NotificationStatus.SENT })
      .execute();
  }

  /**
   * Supprimer une notification
   */
  async remove(id: string, userId: string): Promise<void> {
    const notification = await this.findOne(id);

    if (!notification) {
      throw new Error(`Notification with ID ${id} not found`);
    }

    if (notification.userId !== userId) {
      throw new Error('Unauthorized');
    }

    await this.notificationRepository.remove(notification);
  }

  /**
   * Compter les notifications non lues d'un utilisateur
   */
  async countUnread(userId: string): Promise<number> {
    return this.notificationRepository.count({
      where: {
        userId,
        status: NotificationStatus.SENT,
      },
    });
  }

  /**
   * Envoyer une alerte AML
   */
  async sendAmlAlert(userId: string, alertData: any): Promise<Notification> {
    return this.create({
      userId,
      type: NotificationType.AML_ALERT,
      title: 'Alerte AML',
      message: `Nouvelle alerte AML détectée: ${alertData.description}`,
      data: alertData,
    });
  }

  /**
   * Envoyer une alerte KYC
   */
  async sendKycAlert(userId: string, alertData: any): Promise<Notification> {
    return this.create({
      userId,
      type: NotificationType.KYC_ALERT,
      title: 'Alerte KYC',
      message: `Nouvelle alerte KYC détectée: ${alertData.description}`,
      data: alertData,
    });
  }

  /**
   * Envoyer une notification de mise à jour de document
   */
  async sendDocumentUpdate(userId: string, documentData: any): Promise<Notification> {
    return this.create({
      userId,
      type: NotificationType.DOCUMENT_UPDATE,
      title: 'Mise à jour de document',
      message: `Le document ${documentData.filename} a été mis à jour`,
      data: documentData,
    });
  }

  /**
   * Envoyer une notification de workflow
   */
  async sendWorkflowUpdate(userId: string, workflowData: any): Promise<Notification> {
    return this.create({
      userId,
      type: NotificationType.WORKFLOW_UPDATE,
      title: 'Mise à jour de workflow',
      message: `Le workflow ${workflowData.type} est ${workflowData.status}`,
      data: workflowData,
    });
  }

  /**
   * Envoyer une notification de règle
   */
  async sendRuleAlert(userId: string, ruleData: any): Promise<Notification> {
    return this.create({
      userId,
      type: NotificationType.RULE_ALERT,
      title: 'Alerte de règle',
      message: `La règle ${ruleData.name} a été déclenchée`,
      data: ruleData,
    });
  }

  /**
   * Nettoyer les anciennes notifications
   */
  async cleanupOldNotifications(daysOld: number = 30): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    await this.notificationRepository
      .createQueryBuilder()
      .delete()
      .where('createdAt < :cutoffDate', { cutoffDate })
      .execute();

    this.logger.log(`Notifications plus anciennes que ${daysOld} jours supprimées`);
  }
}
