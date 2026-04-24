import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { ApproveQuestionDto } from './dto/approve-question.dto';
import { Question, QuestionDocument } from './schemas/question.schema';
import { IUser } from 'src/user/user.interface';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectModel(Question.name) private questionModel: Model<QuestionDocument>,
  ) {}

  /**
   * Giáo viên tạo câu hỏi mới
   * Status tự động set thành "pending" (chờ duyệt từ Admin)
   */
  async create(createQuestionDto: CreateQuestionDto, user: IUser) {
    // Kiểm tra correctAnswer có nằm trong options không
    if (!createQuestionDto.options.includes(createQuestionDto.correctAnswer)) {
      throw new BadRequestException(
        'Đáp án đúng phải nằm trong danh sách lựa chọn',
      );
    }

    const question = new this.questionModel({
      ...createQuestionDto,
      status: 'pending', // First time tạo = chờ duyệt
      createBy: {
        _id: user._id,
        email: user.email,
      },
    });

    return await question.save();
  }

  /**
   * Lấy tất cả câu hỏi (hoặc lọc theo status)
   */
  async findAll(status?: string, skip = 0, limit = 10) {
    const query: any = { isDeleted: false };

    if (status) {
      query.status = status;
    }

    const questions = await this.questionModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-deleteBy')
      .exec();

    const total = await this.questionModel.countDocuments(query);

    return {
      data: questions,
      total,
      skip,
      limit,
    };
  }

  /**
   * Lấy tất cả câu hỏi đã duyệt (approved)
   * Dùng khi giáo viên thêm câu hỏi vào quiz
   */
  async findApproved(skip = 0, limit = 10) {
    return this.findAll('approved', skip, limit);
  }

  /**
   * Lấy 1 câu hỏi by ID
   */
  async findOne(id: string) {
    const question = await this.questionModel.findById(id).exec();

    if (!question || question.isDeleted) {
      throw new NotFoundException('Không tìm thấy câu hỏi');
    }

    return question;
  }

  /**
   * Admin duyệt hoặc từ chối câu hỏi
   */
  async approve(
    id: string,
    approveQuestionDto: ApproveQuestionDto,
    user: IUser,
  ) {
    const question = await this.findOne(id);

    if (
      !['pending', 'approved', 'rejected'].includes(approveQuestionDto.status)
    ) {
      throw new BadRequestException(
        'Trạng thái không hợp lệ. Chỉ có: pending, approved, rejected',
      );
    }

    question.status = approveQuestionDto.status;
    // question.updateBy = {
    //   _id: user._id,
    //   email: user.email,
    // };

    question.updateBy = {
      _id: new Types.ObjectId(user._id),
      email: user.email,
    };

    return await question.save();
  }

  /**
   * Giáo viên sửa câu hỏi (chỉ được sửa nếu chưa được duyệt hoặc chưa được dùng)
   */
  async update(id: string, updateQuestionDto: UpdateQuestionDto, user: IUser) {
    const question = await this.findOne(id);

    if (question.status === 'approved') {
      throw new BadRequestException('Không thể sửa câu hỏi đã được duyệt');
    }

    // Kiểm tra correctAnswer nếu có updaten
    if (
      updateQuestionDto.correctAnswer &&
      updateQuestionDto.options &&
      !updateQuestionDto.options.includes(updateQuestionDto.correctAnswer)
    ) {
      throw new BadRequestException(
        'Đáp án đúng phải nằm trong danh sách lựa chọn',
      );
    }

    Object.assign(question, updateQuestionDto);
    // question.updateBy = {
    //   _id: user._id,
    //   email: user.email,
    // };

    return await question.save();
  }

  /**
   * Xóa mềm câu hỏi (soft delete)
   */
  async remove(id: string, user: IUser) {
    const question = await this.findOne(id);

    question.isDeleted = true;
    question.deletedAt = new Date();
    // question.deleteBy = {
    //   _id: user._id,
    //   email: user.email,
    // };

    return await question.save();
  }

  /**
   * Internal: Lấy nhiều câu hỏi by IDs
   */
  async findByIds(ids: string[]) {
    return await this.questionModel
      .find({ _id: { $in: ids }, isDeleted: false })
      .exec();
  }

  async updateApproval(id: string, status: string, user: IUser) {
    const validStatus = ['pending', 'approved', 'inReview'];
    if (!validStatus.includes(status)) {
      throw new BadRequestException('Trạng thái không hợp lệ');
    }

    const question = await this.questionModel.findById(id);
    if (!question) {
      throw new NotFoundException('Không tìm thấy câu hỏi');
    }

    if (user.role.name !== 'ADMIN') {
      throw new ForbiddenException('Bạn không có quyền thực hiện thao tác này');
    }

    question.status = status;

    question.approvedAt = new Date();

    await question.save();

    return {
      message: 'Cập nhật trạng thái câu hỏi thành công',
      data: question,
    };
  }
}
