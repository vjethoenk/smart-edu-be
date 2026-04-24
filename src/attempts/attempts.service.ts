import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateAttemptDto } from './dto/create-attempt.dto';
import { Attempt, AttemptDocument } from './schemas/attempt.schema';

@Injectable()
export class AttemptsService {
  constructor(
    @InjectModel(Attempt.name) private attemptModel: Model<AttemptDocument>,
  ) {}

  /**
   * 🚀 HỌC SINH BẮT ĐẦU LÀM BÀI
   * Tạo 1 Attempt record mới
   * Status: "in_progress"
   * startTime: lúc bấm start
   */
  async create(createAttemptDto: CreateAttemptDto, userId: string) {
    const attempt = new this.attemptModel({
      userId: new Types.ObjectId(userId),
      quizId: new Types.ObjectId(createAttemptDto.quizId),
      startTime: new Date(),
      status: 'in_progress',
    });

    return await attempt.save();
  }

  /**
   * LẤY CHI TIẾT 1 LẦN LÀM BÀI
   */
  async findOne(id: string) {
    const attempt = await this.attemptModel.findById(id).exec();

    if (!attempt) {
      throw new NotFoundException('Không tìm thấy lần làm bài');
    }

    return attempt;
  }

  /**
   * LẤY TOÀN BỘ CÁC LẦN LÀM BÀI CỦA HỌC SINH
   */
  async findUserAttempts(
    userId: string,
    quizId?: string,
    skip = 0,
    limit = 10,
  ) {
    const query: any = { userId: new Types.ObjectId(userId) };

    if (quizId) {
      query.quizId = new Types.ObjectId(quizId);
    }

    const attempts = await this.attemptModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    const total = await this.attemptModel.countDocuments(query);

    return {
      data: attempts,
      total,
      skip,
      limit,
    };
  }

  /**
   * ✅ HỌC SINH NỘP BÀI (SUBMIT)
   * Hệ thống sẽ:
   * 1. Lấy tất cả AttemptAnswer
   * 2. So sánh với correctAnswer
   * 3. Tính điểm
   * 4. Update Attempt: endTime, score, status
   */
  async submit(attemptId: string, totalScore: number) {
    const attempt = await this.findOne(attemptId);

    if (attempt.status === 'submitted') {
      throw new BadRequestException('Bài làm đã được nộp rồi');
    }

    attempt.endTime = new Date();
    attempt.status = 'submitted';
    // Score sẽ được tính bởi AttemptAnswersService

    return await attempt.save();
  }

  /**
   * INTERNAL: Cập nhật score của Attempt
   */
  async updateScore(attemptId: string, score: number) {
    return await this.attemptModel.findByIdAndUpdate(
      attemptId,
      { score },
      { new: true },
    );
  }

  /**
   * INTERNAL: Check nếu Attempt tồn tại
   */
  async attemptExists(id: string): Promise<boolean> {
    const count = await this.attemptModel.countDocuments({ _id: id });
    return count > 0;
  }
}
