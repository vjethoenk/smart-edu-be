import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { User } from 'src/user/schemas/user.schema';
import { Course } from 'src/courses/schemas/course.schema';

export type ChatDocument = HydratedDocument<Chat>;

@Schema({ timestamps: true })
export class Chat {
  // Khóa học mà conversation này liên quan đến
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true })
  courseId!: Types.ObjectId;

  // Người gửi tin nhắn (học viên hoặc giảng viên)
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  senderId!: Types.ObjectId;

  // Người nhận tin nhắn (giảng viên hoặc học viên)
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  receiverId!: Types.ObjectId;

  // Nội dung tin nhắn
  @Prop({ required: true, maxlength: 5000 })
  message!: string;

  // Loại nội dung: text, image, file
  @Prop({ default: 'text', enum: ['text', 'image', 'file'] })
  messageType!: string;

  // URL của file/image nếu có
  @Prop()
  fileUrl?: string;

  // Tên file nếu có
  @Prop()
  fileName?: string;

  // Trạng thái đã đọc
  @Prop({ default: false })
  isRead!: boolean;

  // Thời gian đánh dấu đã đọc
  @Prop()
  readAt?: Date;

  // Người tạo tin nhắn (thường là senderId, nhưng để cho khớp với chuẩn)
  @Prop({ type: Object })
  createdBy?: {
    _id: Types.ObjectId;
    email: string;
    name: string;
  };

  @Prop()
  createdAt!: Date;

  @Prop()
  updatedAt!: Date;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);

// Tạo index để tìm kiếm nhanh
ChatSchema.index({ courseId: 1, senderId: 1, receiverId: 1 });
ChatSchema.index({ courseId: 1, createdAt: -1 });
ChatSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });
