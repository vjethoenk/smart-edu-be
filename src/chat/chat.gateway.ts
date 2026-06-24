import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import {
  SendMessageDto,
  MarkAsReadDto,
  TypingIndicatorDto,
} from './dto/socket-message.dto';
import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Types } from 'mongoose';

/**
 * Chat Gateway - Xử lý WebSocket connections
 * Endpoint: ws://localhost:3000/chat
 */
@WebSocketGateway({
  namespace: 'chat',
  cors: {
    origin: [
      'https://smart-edu-fe.vercel.app',
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:8081',
    ],
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
@Injectable()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private logger = new Logger('ChatGateway');

  // Map lưu trữ user ID -> socket IDs (vì một user có thể connect từ nhiều tab)
  private userSockets = new Map<string, Set<string>>();

  constructor(
    private chatService: ChatService,
    private jwtService: JwtService,
  ) {}

  /**
   * Xử lý khi client connect
   * Client phải gửi token trong query: ?token=jwt_token
   */
  handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;

      if (!token) {
        this.logger.warn('Client connect không có token');
        client.disconnect();
        return;
      }

      // Verify JWT token
      const decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_ACCESS_TOKEN_SECRET || process.env.JWT_SECRET,
      }) as any;

      const userId =
        decoded?._id?.toString() || decoded?.sub?.toString() || undefined;

      if (!userId || !Types.ObjectId.isValid(userId)) {
        this.logger.warn('Invalid token payload user id', decoded);
        client.disconnect();
        return;
      }

      client.data.userId = userId;
      client.data.email = decoded.email;

      // Lưu mapping user -> sockets
      if (!this.userSockets.has(decoded.sub)) {
        this.userSockets.set(decoded.sub, new Set());
      }
      this.userSockets.get(decoded.sub)?.add(client.id);

      this.logger.log(
        `User ${decoded.email} connected with socket ${client.id}`,
      );

      // Gửi sự kiện connection thành công
      client.emit('connection_success', {
        message: 'Kết nối thành công',
        userId: decoded.sub,
      });
    } catch (error) {
      this.logger.error('Connection error:', error);
      client.disconnect();
    }
  }

  /**
   * Xử lý khi client disconnect
   */
  handleDisconnect(client: Socket) {
    const userId = client.data.userId;

    if (userId) {
      const userSocketsSet = this.userSockets.get(userId);
      userSocketsSet?.delete(client.id);

      if (userSocketsSet?.size === 0) {
        this.userSockets.delete(userId);
        this.logger.log(`User ${userId} completely disconnected`);
      } else {
        this.logger.log(
          `User ${userId} disconnected from socket ${client.id}, still has ${userSocketsSet?.size} connections`,
        );
      }
    }
  }

  /**
   * Event: Gửi tin nhắn
   * Client emit: socket.emit('sendMessage', {...})
   */
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: SendMessageDto,
  ) {
    try {
      const senderId = client.data.userId;

      // Tạo tin nhắn trong DB
      const message = await this.chatService.createMessage(data, senderId);

      // Emit tin nhắn đến receiver thông qua course room
      const roomName = `course_${data.courseId}`;
      client.broadcast.to(roomName).emit('newMessage', {
        ...message.toObject(),
        senderInfo: {
          _id: message.senderId,
          email: client.data.email,
        },
      });

      // Emit lại cho sender biết tin nhắn đã được lưu
      client.emit('messageSent', {
        ...message.toObject(),
        status: 'sent',
      });

      this.logger.log(
        `Message sent from ${senderId} to ${data.receiverId} in course ${data.courseId}`,
      );

      return { success: true, chatId: message._id };
    } catch (error) {
      this.logger.error('Error sending message:', error);
      client.emit('messageError', {
        error: error instanceof Error ? error.message : 'Lỗi gửi tin nhắn',
      });
      return { success: false };
    }
  }

  /**
   * Event: Vào một khóa học (join room)
   * Client emit: socket.emit('joinCourse', { courseId: 'xxx' })
   */
  @SubscribeMessage('joinCourse')
  handleJoinCourse(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { courseId: string },
  ) {
    try {
      const roomName = `course_${data.courseId}`;
      client.join(roomName);

      this.logger.log(`User ${client.data.userId} joined room ${roomName}`);

      // Thông báo cho những user khác trong room biết có người vừa join
      client.broadcast.to(roomName).emit('userJoinedCourse', {
        userId: client.data.userId,
        email: client.data.email,
        timestamp: new Date(),
      });

      return { success: true, message: 'Joined course' };
    } catch (error) {
      this.logger.error('Error joining course:', error);
      return { success: false };
    }
  }

  /**
   * Event: Rời khóa học (leave room)
   * Client emit: socket.emit('leaveCourse', { courseId: 'xxx' })
   */
  @SubscribeMessage('leaveCourse')
  handleLeaveCourse(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { courseId: string },
  ) {
    try {
      const roomName = `course_${data.courseId}`;
      client.leave(roomName);

      this.logger.log(`User ${client.data.userId} left room ${roomName}`);

      // Thông báo cho những user khác trong room
      client.broadcast.to(roomName).emit('userLeftCourse', {
        userId: client.data.userId,
        timestamp: new Date(),
      });

      return { success: true, message: 'Left course' };
    } catch (error) {
      this.logger.error('Error leaving course:', error);
      return { success: false };
    }
  }

  /**
   * Event: Đánh dấu tin nhắn đã đọc
   * Client emit: socket.emit('markAsRead', { chatId: 'xxx' })
   */
  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: MarkAsReadDto,
  ) {
    try {
      const message = await this.chatService.markAsRead(data.chatId);

      // Thông báo cho sender biết tin nhắn đã được đọc
      const senderSockets = this.userSockets.get(message.senderId.toString());
      if (senderSockets) {
        senderSockets.forEach((socketId) => {
          this.server.to(socketId).emit('messageRead', {
            chatId: data.chatId,
            readAt: message.readAt,
            readBy: client.data.userId,
          });
        });
      }

      return { success: true };
    } catch (error) {
      this.logger.error('Error marking as read:', error);
      return { success: false };
    }
  }

  /**
   * Event: Gửi thông báo đang gõ
   * Client emit: socket.emit('typing', { courseId, receiverId })
   */
  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: TypingIndicatorDto,
  ) {
    try {
      const receiverSockets = this.userSockets.get(data.receiverId);

      if (receiverSockets) {
        receiverSockets.forEach((socketId) => {
          this.server.to(socketId).emit('userTyping', {
            courseId: data.courseId,
            userId: client.data.userId,
            email: client.data.email,
          });
        });
      }

      return { success: true };
    } catch (error) {
      this.logger.error('Error sending typing indicator:', error);
      return { success: false };
    }
  }

  /**
   * Event: Dừng gõ
   * Client emit: socket.emit('stopTyping', { courseId, receiverId })
   */
  @SubscribeMessage('stopTyping')
  handleStopTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: TypingIndicatorDto,
  ) {
    try {
      const receiverSockets = this.userSockets.get(data.receiverId);

      if (receiverSockets) {
        receiverSockets.forEach((socketId) => {
          this.server.to(socketId).emit('userStopTyping', {
            courseId: data.courseId,
            userId: client.data.userId,
          });
        });
      }

      return { success: true };
    } catch (error) {
      this.logger.error('Error stopping typing indicator:', error);
      return { success: false };
    }
  }

  /**
   * Event: Vào cuộc trò chuyện riêng
   * Client emit: socket.emit('joinPrivateChat', { courseId, otherUserId })
   */
  @SubscribeMessage('joinPrivateChat')
  handleJoinPrivateChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { courseId: string; otherUserId: string },
  ) {
    try {
      // Tạo room name duy nhất cho cuộc trò chuyện riêng
      const userIds = [client.data.userId, data.otherUserId].sort();
      const roomName = `private_${data.courseId}_${userIds[0]}_${userIds[1]}`;

      client.join(roomName);

      this.logger.log(
        `User ${client.data.userId} joined private chat room ${roomName}`,
      );

      return { success: true, roomName };
    } catch (error) {
      this.logger.error('Error joining private chat:', error);
      return { success: false };
    }
  }

  /**
   * Helper: Gửi tin nhắn đến user cụ thể
   * Sử dụng trong service hoặc controller
   */
  sendToUser(userId: string, event: string, data: any) {
    const userSockets = this.userSockets.get(userId);
    if (userSockets) {
      userSockets.forEach((socketId) => {
        this.server.to(socketId).emit(event, data);
      });
    }
  }

  /**
   * Helper: Broadcast đến toàn bộ users trong course
   */
  broadcastToCourse(courseId: string, event: string, data: any) {
    const roomName = `course_${courseId}`;
    this.server.to(roomName).emit(event, data);
  }
}
