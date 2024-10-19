import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { NotificationService } from './notification.service';

@WebSocketGateway()
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('NotificationGateway');

  constructor(private readonly notificationService: NotificationService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(client: Socket, userId: string) {
    client.join(userId);
    this.logger.log(`Client ${client.id} subscribed to notifications for user ${userId}`);
  }

  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(client: Socket, userId: string) {
    client.leave(userId);
    this.logger.log(`Client ${client.id} unsubscribed from notifications for user ${userId}`);
  }

  sendNotificationToUser(userId: string, message: string) {
    this.server.to(userId).emit('notification', message);
  }
}
