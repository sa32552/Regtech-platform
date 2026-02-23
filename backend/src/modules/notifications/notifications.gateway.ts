import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsGuard } from './guards/ws.guard';

interface NotificationPayload {
  type: 'ALERT' | 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR';
  title: string;
  message: string;
  data?: any;
  timestamp: Date;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/notifications',
})
@UseGuards(WsGuard)
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private connectedUsers: Map<string, Socket> = new Map();

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        this.logger.warn('Connexion sans token');
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const userId = payload.sub;

      this.connectedUsers.set(userId, client);
      this.logger.log(`Utilisateur ${userId} connecté aux notifications`);

      // Envoyer un message de bienvenue
      client.emit('connected', {
        message: 'Connecté au service de notifications',
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.error(`Erreur de connexion: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    // Trouver l'utilisateur déconnecté
    let disconnectedUserId: string | null = null;
    for (const [userId, socket] of this.connectedUsers.entries()) {
      if (socket.id === client.id) {
        disconnectedUserId = userId;
        break;
      }
    }

    if (disconnectedUserId) {
      this.connectedUsers.delete(disconnectedUserId);
      this.logger.log(`Utilisateur ${disconnectedUserId} déconnecté des notifications`);
    }
  }

  /**
   * Envoyer une notification à un utilisateur spécifique
   */
  async sendNotificationToUser(userId: string, notification: NotificationPayload) {
    const socket = this.connectedUsers.get(userId);

    if (socket) {
      socket.emit('notification', notification);
      this.logger.log(`Notification envoyée à l'utilisateur ${userId}`);
      return true;
    }

    this.logger.warn(`Utilisateur ${userId} non connecté, notification non envoyée`);
    return false;
  }

  /**
   * Envoyer une notification à tous les utilisateurs connectés
   */
  async broadcastNotification(notification: NotificationPayload) {
    this.server.emit('notification', notification);
    this.logger.log('Notification broadcastée à tous les utilisateurs');
  }

  /**
   * Envoyer une notification aux utilisateurs avec un rôle spécifique
   */
  async sendNotificationToRole(role: string, notification: NotificationPayload) {
    // Cette méthode nécessite une implémentation pour récupérer les utilisateurs par rôle
    // Pour l'instant, nous allons simplement broadcaster
    this.server.emit('notification', notification);
    this.logger.log(`Notification envoyée au rôle ${role}`);
  }

  /**
   * Envoyer une alerte AML
   */
  async sendAmlAlert(userId: string, alertData: any) {
    await this.sendNotificationToUser(userId, {
      type: 'ALERT',
      title: 'Alerte AML',
      message: `Nouvelle alerte AML détectée: ${alertData.description}`,
      data: alertData,
      timestamp: new Date(),
    });
  }

  /**
   * Envoyer une alerte KYC
   */
  async sendKycAlert(userId: string, alertData: any) {
    await this.sendNotificationToUser(userId, {
      type: 'ALERT',
      title: 'Alerte KYC',
      message: `Nouvelle alerte KYC détectée: ${alertData.description}`,
      data: alertData,
      timestamp: new Date(),
    });
  }

  /**
   * Envoyer une notification de mise à jour de document
   */
  async sendDocumentUpdate(userId: string, documentData: any) {
    await this.sendNotificationToUser(userId, {
      type: 'INFO',
      title: 'Mise à jour de document',
      message: `Le document ${documentData.filename} a été mis à jour`,
      data: documentData,
      timestamp: new Date(),
    });
  }

  /**
   * Envoyer une notification de workflow
   */
  async sendWorkflowUpdate(userId: string, workflowData: any) {
    const type = workflowData.status === 'COMPLETED' ? 'SUCCESS' : 'INFO';
    await this.sendNotificationToUser(userId, {
      type,
      title: 'Mise à jour de workflow',
      message: `Le workflow ${workflowData.type} est ${workflowData.status}`,
      data: workflowData,
      timestamp: new Date(),
    });
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    client.emit('pong', { timestamp: new Date() });
  }

  @SubscribeMessage('mark-as-read')
  handleMarkAsRead(@MessageBody() data: { notificationId: string }) {
    // Implémentation pour marquer une notification comme lue
    this.logger.log(`Notification ${data.notificationId} marquée comme lue`);
  }
}
