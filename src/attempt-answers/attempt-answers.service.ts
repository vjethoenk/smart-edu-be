import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateAttemptAnswerDto } from './dto/create-attempt-answer.dto';
import {
  AttemptAnswer,
  AttemptAnswerDocument,
} from './schemas/attempt-answer.schema';

@Injectable()
export class AttemptAnswersService {
  constructor(
    @InjectModel(AttemptAnswer.name)
    private attemptAnswerModel: Model<AttemptAnswerDocument>,
  ) {}

  /**
   * 💾 LƯU 1 CÂU TRẢ LỜI
   * Dùng khi học sinh chọn đáp án (real-time save)
   */
  async create(
    createAttemptAnswerDto: CreateAttemptAnswerDto,
    correctAnswer: string,
  ) {
    // Kiểm tra nếu đã trả lời câu hỏi này trong lần này rồi → update
    const existingAnswer = await this.attemptAnswerModel.findOne({
      attemptId: new Types.ObjectId(createAttemptAnswerDto.attemptId),
      questionId: new Types.ObjectId(createAttemptAnswerDto.questionId),
    });

    const isCorrect = createAttemptAnswerDto.selectedAnswer === correctAnswer;
    const score = isCorrect ? 1 : 0;

    if (existingAnswer) {
      existingAnswer.selectedAnswer = createAttemptAnswerDto.selectedAnswer;
      existingAnswer.isCorrect = isCorrect;
      existingAnswer.score = score;
      return await existingAnswer.save();
    }

    const answer = new this.attemptAnswerModel({
      attemptId: new Types.ObjectId(createAttemptAnswerDto.attemptId),
      questionId: new Types.ObjectId(createAttemptAnswerDto.questionId),
      selectedAnswer: createAttemptAnswerDto.selectedAnswer,
      isCorrect,
      score,
    });

    return await answer.save();
  }

  /**
   * 💾 LƯU NHIỀU CÂU TRẢ LỜI (BATCH)
   * Dùng khi học sinh nộp bài (save all at once)
   */
  async createBatch(
    attemptId: string,
    answers: Array<{
      questionId: string;
      selectedAnswer: string;
      correctAnswer: string;
    }>,
  ) {
    const attemptAnswers = answers.map((answer) => {
      const isCorrect = answer.selectedAnswer === answer.correctAnswer;
      return {
        attemptId: new Types.ObjectId(attemptId),
        questionId: new Types.ObjectId(answer.questionId),
        selectedAnswer: answer.selectedAnswer,
        isCorrect,
        score: isCorrect ? 1 : 0,
      };
    });

    // Delete old answers for this attempt first
    await this.attemptAnswerModel.deleteMany({
      attemptId: new Types.ObjectId(attemptId),
    });

    // Insert new answers
    return await this.attemptAnswerModel.insertMany(attemptAnswers);
  }

  /**
   * 📝 LẤY TẤT CẢ CÂU TRẢ LỜI CỦA 1 LẦN LÀM BÀI
   */
  async findByAttempt(attemptId: string) {
    const answers = await this.attemptAnswerModel
      .find({ attemptId: new Types.ObjectId(attemptId) })
      .exec();

    return answers;
  }

  /**
   * ✅ TÍNH ĐIỂM CỦA NGƯỜI HỌC
   * Lấy tất cả câu trả lời → cộng lại score
   * Trả về: số điểm, số câu đúng, số câu sai
   */
  async gradeAttempt(attemptId: string) {
    const answers = await this.findByAttempt(attemptId);

    if (answers.length === 0) {
      return {
        totalScore: 0,
        correctCount: 0,
        incorrectCount: 0,
        unansweredCount: 0,
        details: [],
      };
    }

    const totalScore = answers.reduce((sum, answer) => sum + answer.score, 0);
    const correctCount = answers.filter((a) => a.isCorrect).length;
    const incorrectCount = answers.filter((a) => !a.isCorrect).length;

    return {
      totalScore,
      correctCount,
      incorrectCount,
      totalQuestions: answers.length,
      details: answers,
    };
  }

  /**
   * 📋 LẤY CHI TIẾT 1 CÂU TRẢ LỜI
   */
  async findOne(answerId: string) {
    const answer = await this.attemptAnswerModel.findById(answerId).exec();

    if (!answer) {
      throw new NotFoundException('Không tìm thấy câu trả lời');
    }

    return answer;
  }

  /**
   * INTERNAL: Check nếu có câu trả lời nào
   */
  async hasAnswers(attemptId: string): Promise<boolean> {
    const count = await this.attemptAnswerModel.countDocuments({
      attemptId: new Types.ObjectId(attemptId),
    });
    return count > 0;
  }
}
