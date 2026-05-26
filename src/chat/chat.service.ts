import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Chat, ChatDocument } from './schemas/chat.schema';
import { CreateChatDto } from './dto/create-chat.dto';
import { User } from 'src/user/schemas/user.schema';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Chat.name) private chatModel: Model<ChatDocument>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  /**
   * Tạo một tin nhắn mới
   * @param createChatDto - Dữ liệu tin nhắn
   * @param senderId - ID của người gửi (từ JWT)
   */
  async createMessage(createChatDto: CreateChatDto, senderId: string) {
    if (!Types.ObjectId.isValid(senderId)) {
      throw new BadRequestException('Sender ID không hợp lệ');
    }

    if (!Types.ObjectId.isValid(createChatDto.receiverId)) {
      throw new BadRequestException('Receiver ID không hợp lệ');
    }

    // Kiểm tra sender, receiver, và course tồn tại
    const sender = await this.userModel.findById(senderId);
    if (!sender) {
      throw new NotFoundException('Người gửi không tồn tại');
    }

    const receiver = await this.userModel.findById(createChatDto.receiverId);
    if (!receiver) {
      throw new NotFoundException('Người nhận không tồn tại');
    }

    // Tạo document tin nhắn
    const chat = new this.chatModel({
      courseId: new Types.ObjectId(createChatDto.courseId),
      senderId: new Types.ObjectId(senderId),
      receiverId: new Types.ObjectId(createChatDto.receiverId),
      message: createChatDto.message,
      messageType: createChatDto.messageType || 'text',
      fileUrl: createChatDto.fileUrl,
      fileName: createChatDto.fileName,
      createdBy: {
        _id: sender._id,
        email: sender.email,
        name: sender.name,
      },
    });

    return await chat.save();
  }

  /**
   * Lấy danh sách tin nhắn của một khóa học
   * @param courseId - ID khóa học
   * @param page - Số trang (1-indexed)
   * @param limit - Số tin nhắn per page
   * @param userId - ID của user hiện tại (để filter tin nhắn liên quan)
   */
  async getMessagesByCourse(
    courseId: string,
    page: number = 1,
    limit: number = 50,
    userId?: string,
  ) {
    const skip = (page - 1) * limit;

    const query: any = { courseId: new Types.ObjectId(courseId) };

    // Nếu có userId, chỉ lấy tin nhắn giữa user đó với người khác
    if (userId) {
      query.$or = [
        { senderId: new Types.ObjectId(userId) },
        { receiverId: new Types.ObjectId(userId) },
      ];
    }

    const messages = await this.chatModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'senderId',
        select: 'name email avatar',
      })
      .populate({
        path: 'receiverId',
        select: 'name email avatar',
      })
      .lean();

    const total = await this.chatModel.countDocuments(query);

    return {
      data: messages.reverse(), // Reverse để hiển thị theo thứ tự tăng dần
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Lấy các cuộc trò chuyện riêng của user trong một khóa học
   * @param courseId - ID khóa học
   * @param userId - ID của user
   */
  async getConversationsByUserInCourse(courseId: string, userId: string) {
    // Aggregate để lấy các conversation partners duy nhất
    const conversations = await this.chatModel.aggregate([
      {
        $match: {
          courseId: new Types.ObjectId(courseId),
          $or: [
            { senderId: new Types.ObjectId(userId) },
            { receiverId: new Types.ObjectId(userId) },
          ],
        },
      },
      {
        $group: {
          _id: {
            courseId: '$courseId',
            participant1: {
              $cond: [
                { $eq: ['$senderId', new Types.ObjectId(userId)] },
                '$receiverId',
                '$senderId',
              ],
            },
          },
          lastMessage: { $last: '$message' },
          lastMessageTime: { $last: '$createdAt' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$receiverId', new Types.ObjectId(userId)] },
                    { $eq: ['$isRead', false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          senderId: { $last: '$senderId' },
          receiverId: { $last: '$receiverId' },
        },
      },
      {
        $sort: { lastMessageTime: -1 },
      },
    ]);

    // Populate user info
    const conversationsWithUserInfo = await Promise.all(
      conversations.map(async (conv) => {
        const otherUserId = conv._id.participant1;
        const otherUser = await this.userModel
          .findById(otherUserId)
          .select('name email avatar');

        return {
          ...conv,
          otherUser,
        };
      }),
    );

    return conversationsWithUserInfo;
  }

  /**
   * Lấy tin nhắn giữa 2 user trong một khóa học
   * @param courseId - ID khóa học
   * @param userId1 - ID user 1
   * @param userId2 - ID user 2
   * @param page - Số trang
   * @param limit - Số tin nhắn per page
   */
  async getConversation(
    courseId: string,
    userId1: string,
    userId2: string,
    page: number = 1,
    limit: number = 50,
  ) {
    const skip = (page - 1) * limit;

    const messages = await this.chatModel
      .find({
        courseId: new Types.ObjectId(courseId),
        $or: [
          {
            senderId: new Types.ObjectId(userId1),
            receiverId: new Types.ObjectId(userId2),
          },
          {
            senderId: new Types.ObjectId(userId2),
            receiverId: new Types.ObjectId(userId1),
          },
        ],
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'senderId',
        select: 'name email avatar',
      })
      .populate({
        path: 'receiverId',
        select: 'name email avatar',
      })
      .lean();

    const total = await this.chatModel.countDocuments({
      courseId: new Types.ObjectId(courseId),
      $or: [
        {
          senderId: new Types.ObjectId(userId1),
          receiverId: new Types.ObjectId(userId2),
        },
        {
          senderId: new Types.ObjectId(userId2),
          receiverId: new Types.ObjectId(userId1),
        },
      ],
    });

    return {
      data: messages.reverse(),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Đánh dấu tin nhắn đã đọc
   * @param chatId - ID tin nhắn
   */
  async markAsRead(chatId: string) {
    const chat = await this.chatModel.findByIdAndUpdate(
      chatId,
      {
        isRead: true,
        readAt: new Date(),
      },
      { new: true },
    );

    if (!chat) {
      throw new NotFoundException('Tin nhắn không tồn tại');
    }

    return chat;
  }

  /**
   * Đánh dấu tất cả tin nhắn đã đọc giữa 2 user
   * @param courseId - ID khóa học
   * @param senderId - ID người gửi
   * @param receiverId - ID người nhận
   */
  async markAllAsRead(courseId: string, senderId: string, receiverId: string) {
    return await this.chatModel.updateMany(
      {
        courseId: new Types.ObjectId(courseId),
        senderId: new Types.ObjectId(senderId),
        receiverId: new Types.ObjectId(receiverId),
        isRead: false,
      },
      {
        $set: {
          isRead: true,
          readAt: new Date(),
        },
      },
    );
  }

  /**
   * Xóa tin nhắn (soft delete)
   * @param chatId - ID tin nhắn
   */
  async deleteMessage(chatId: string) {
    const chat = await this.chatModel.findByIdAndDelete(chatId);

    if (!chat) {
      throw new NotFoundException('Tin nhắn không tồn tại');
    }

    return chat;
  }

  /**
   * Lấy số tin nhắn chưa đọc
   * @param userId - ID user
   * @param courseId - ID khóa học (optional)
   */
  async getUnreadCount(userId: string, courseId?: string) {
    const query: any = {
      receiverId: new Types.ObjectId(userId),
      isRead: false,
    };

    if (courseId) {
      query.courseId = new Types.ObjectId(courseId);
    }

    return await this.chatModel.countDocuments(query);
  }

  /**
   * Tìm kiếm tin nhắn
   * @param courseId - ID khóa học
   * @param userId - ID user
   * @param searchText - Nội dung tìm kiếm
   */
  async getAllConversations(userId: string) {
    const objectId = new Types.ObjectId(userId);

    const conversations = await this.chatModel
      .aggregate([
        {
          $match: {
            $or: [{ senderId: objectId }, { receiverId: objectId }],
          },
        },
        {
          $sort: { createdAt: -1 },
        },
        {
          $group: {
            _id: {
              courseId: '$courseId',
              participant: {
                $cond: [
                  { $eq: ['$senderId', objectId] },
                  '$receiverId',
                  '$senderId',
                ],
              },
            },
            lastMessage: { $first: '$message' },
            lastMessageTime: { $first: '$createdAt' },
            unreadCount: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ['$receiverId', objectId] },
                      { $eq: ['$isRead', false] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            lastSenderId: { $first: '$senderId' },
            lastReceiverId: { $first: '$receiverId' },
          },
        },
        {
          $sort: { lastMessageTime: -1 },
        },
      ])
      .exec();

    const populated = await Promise.all(
      conversations.map(async (conversation) => {
        const otherUser = await this.userModel
          .findById(conversation._id.participant)
          .select('name email avatar');

        return {
          ...conversation,
          otherUser,
        };
      }),
    );

    return populated;
  }

  async searchMessages(courseId: string, userId: string, searchText: string) {
    return await this.chatModel
      .find({
        courseId: new Types.ObjectId(courseId),
        $or: [
          { senderId: new Types.ObjectId(userId) },
          { receiverId: new Types.ObjectId(userId) },
        ],
        message: { $regex: searchText, $options: 'i' },
      })
      .sort({ createdAt: -1 })
      .populate({
        path: 'senderId',
        select: 'name email avatar',
      })
      .populate({
        path: 'receiverId',
        select: 'name email avatar',
      })
      .limit(50)
      .lean();
  }
}
