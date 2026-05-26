import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Delete,
  UseGuards,
  Request,
  HttpCode,
  BadRequestException,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

/**
 * Chat Controller - REST API
 * Endpoint: /v1/chat
 */
@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  /**
   * POST /v1/chat/message
   * Tạo tin nhắn mới
   *
   * Request body:
   * {
   *   "courseId": "65f1a2b3c4d5e6f7g8h9i0j1",
   *   "receiverId": "65f1a2b3c4d5e6f7g8h9i0j2",
   *   "message": "Xin chào",
   *   "messageType": "text" (optional: text | image | file),
   *   "fileUrl": "https://...", (optional)
   *   "fileName": "document.pdf" (optional)
   * }
   *
   * Response:
   * {
   *   "_id": "65f1a2b3c4d5e6f7g8h9i0j3",
   *   "courseId": "65f1a2b3c4d5e6f7g8h9i0j1",
   *   "senderId": "65f1a2b3c4d5e6f7g8h9i0jX",
   *   "receiverId": "65f1a2b3c4d5e6f7g8h9i0j2",
   *   "message": "Xin chào",
   *   "messageType": "text",
   *   "isRead": false,
   *   "createdAt": "2024-05-26T10:00:00.000Z",
   *   "updatedAt": "2024-05-26T10:00:00.000Z"
   * }
   */
  @Post('message')
  @HttpCode(201)
  async createMessage(
    @Body() createChatDto: CreateChatDto,
    @Request() req: any,
  ) {
    return await this.chatService.createMessage(
      createChatDto,
      req.user._id || req.user.sub,
    );
  }

  /**
   * GET /v1/chat/messages/:courseId
   * Lấy danh sách tin nhắn của một khóa học
   *
   * Query parameters:
   * - page: số trang (default: 1)
   * - limit: số tin nhắn per page (default: 50, max: 100)
   *
   * Response:
   * {
   *   "data": [
   *     {
   *       "_id": "...",
   *       "courseId": "...",
   *       "senderId": { "_id": "...", "name": "...", "email": "..." },
   *       "receiverId": { "_id": "...", "name": "...", "email": "..." },
   *       "message": "...",
   *       "messageType": "text",
   *       "isRead": true,
   *       "readAt": "2024-05-26T10:05:00.000Z",
   *       "createdAt": "2024-05-26T10:00:00.000Z"
   *     }
   *   ],
   *   "pagination": {
   *     "page": 1,
   *     "limit": 50,
   *     "total": 120,
   *     "pages": 3
   *   }
   * }
   */
  @Get('messages/:courseId')
  async getMessagesByCourse(
    @Param('courseId') courseId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50',
    @Request() req: any,
  ) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));

    return await this.chatService.getMessagesByCourse(
      courseId,
      pageNum,
      limitNum,
      req.user._id || req.user.sub,
    );
  }

  /**
   * GET /v1/chat/conversations/:courseId
   * Lấy danh sách các cuộc trò chuyện của user trong một khóa học
   *
   * Response:
   * [
   *   {
   *     "_id": {
   *       "courseId": "...",
   *       "participant1": "..."
   *     },
   *     "lastMessage": "Hello",
   *     "lastMessageTime": "2024-05-26T10:00:00.000Z",
   *     "unreadCount": 3,
   *     "otherUser": {
   *       "_id": "...",
   *       "name": "...",
   *       "email": "...",
   *       "avatar": "..."
   *     }
   *   }
   * ]
   */
  @Get('conversations')
  async getAllConversations(@Request() req: any) {
    return await this.chatService.getAllConversations(
      req.user._id || req.user.sub,
    );
  }

  @Get('conversations/:courseId')
  async getConversationsByUserInCourse(
    @Param('courseId') courseId: string,
    @Request() req: any,
  ) {
    return await this.chatService.getConversationsByUserInCourse(
      courseId,
      req.user._id || req.user.sub,
    );
  }

  /**
   * GET /v1/chat/conversation/:courseId/:otherUserId
   * Lấy tin nhắn giữa 2 user trong một khóa học
   *
   * Query parameters:
   * - page: số trang (default: 1)
   * - limit: số tin nhắn per page (default: 50)
   *
   * Response:
   * {
   *   "data": [
   *     {
   *       "_id": "...",
   *       "courseId": "...",
   *       "senderId": { "_id": "...", "name": "...", "email": "..." },
   *       "receiverId": { "_id": "...", "name": "...", "email": "..." },
   *       "message": "...",
   *       "messageType": "text",
   *       "isRead": true,
   *       "createdAt": "2024-05-26T10:00:00.000Z"
   *     }
   *   ],
   *   "pagination": {
   *     "page": 1,
   *     "limit": 50,
   *     "total": 245,
   *     "pages": 5
   *   }
   * }
   */
  @Get('conversation/:courseId/:otherUserId')
  async getConversation(
    @Param('courseId') courseId: string,
    @Param('otherUserId') otherUserId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50',
    @Request() req: any,
  ) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));

    return await this.chatService.getConversation(
      courseId,
      req.user._id || req.user.sub,
      otherUserId,
      pageNum,
      limitNum,
    );
  }

  /**
   * PUT /v1/chat/message/:chatId/read
   * Đánh dấu tin nhắn đã đọc
   *
   * Response:
   * {
   *   "_id": "...",
   *   "isRead": true,
   *   "readAt": "2024-05-26T10:05:00.000Z"
   * }
   */
  @Post('message/:chatId/read')
  @HttpCode(200)
  async markAsRead(@Param('chatId') chatId: string) {
    return await this.chatService.markAsRead(chatId);
  }

  /**
   * PUT /v1/chat/conversation/:courseId/:receiverId/read-all
   * Đánh dấu tất cả tin nhắn từ một user là đã đọc
   *
   * Response:
   * {
   *   "modifiedCount": 5,
   *   "message": "Marked 5 messages as read"
   * }
   */
  @Post('conversation/:courseId/:receiverId/read-all')
  @HttpCode(200)
  async markAllAsRead(
    @Param('courseId') courseId: string,
    @Param('receiverId') receiverId: string,
    @Request() req: any,
  ) {
    const result = await this.chatService.markAllAsRead(
      courseId,
      receiverId,
      req.user._id || req.user.sub,
    );

    return {
      modifiedCount: result.modifiedCount,
      message: `Marked ${result.modifiedCount} messages as read`,
    };
  }

  /**
   * DELETE /v1/chat/message/:chatId
   * Xóa tin nhắn
   *
   * Response:
   * {
   *   "_id": "...",
   *   "message": "Deleted successfully"
   * }
   */
  @Delete('message/:chatId')
  @HttpCode(200)
  async deleteMessage(@Param('chatId') chatId: string) {
    const message = await this.chatService.deleteMessage(chatId);
    return {
      _id: message._id,
      message: 'Deleted successfully',
    };
  }

  /**
   * GET /v1/chat/unread-count
   * Lấy số tin nhắn chưa đọc
   *
   * Query parameters:
   * - courseId: ID khóa học (optional)
   *
   * Response:
   * {
   *   "count": 5
   * }
   */
  @Get('unread-count')
  async getUnreadCount(
    @Query('courseId') courseId: string,
    @Request() req: any,
  ) {
    const count = await this.chatService.getUnreadCount(
      req.user._id || req.user.sub,
      courseId,
    );
    return { count };
  }

  /**
   * GET /v1/chat/search/:courseId
   * Tìm kiếm tin nhắn
   *
   * Query parameters:
   * - q: Nội dung tìm kiếm (bắt buộc)
   *
   * Response:
   * [
   *   {
   *     "_id": "...",
   *     "message": "...",
   *     "senderId": { "_id": "...", "name": "...", "email": "..." },
   *     "createdAt": "2024-05-26T10:00:00.000Z"
   *   }
   * ]
   */
  @Get('search/:courseId')
  async searchMessages(
    @Param('courseId') courseId: string,
    @Query('q') searchText: string,
    @Request() req: any,
  ) {
    if (!searchText || searchText.trim().length === 0) {
      throw new BadRequestException('Search text is required');
    }

    return await this.chatService.searchMessages(
      courseId,
      req.user._id || req.user.sub,
      searchText,
    );
  }
}
