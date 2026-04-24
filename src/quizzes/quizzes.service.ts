import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { CreateQuizQuestionDto } from './dto/create-quiz-question.dto';
import { IUser } from 'src/user/user.interface';
import { Quiz, QuizDocument } from './schemas/quiz.schema';
import {
  QuizQuestion,
  QuizQuestionDocument,
} from './schemas/quiz-question.schema';

@Injectable()
export class QuizzesService {
  constructor(
    @InjectModel(Quiz.name) private quizModel: Model<QuizDocument>,
    @InjectModel(QuizQuestion.name)
    private quizQuestionModel: Model<QuizQuestionDocument>,
  ) {}

  /**
   * 3️⃣ GIÁO VIÊN TẠO BÀI QUIZ
   */
  async create(createQuizDto: CreateQuizDto, user: IUser) {
    if (createQuizDto.passScore > createQuizDto.totalScore) {
      throw new BadRequestException(
        'Điểm đạt phải nhỏ hơn hoặc bằng tổng điểm',
      );
    }

    const quiz = await this.quizModel.create({
      ...createQuizDto,
      createBy: {
        _id: user._id,
        email: user.email,
      },
    });

    return quiz;
  }

  /**
   * LẤY TOÀN BỘ QUIZ (CÓ FILTER)
   */
  async findAll(courseId?: string, sectionId?: string, skip = 0, limit = 10) {
    const query: any = { isDeleted: false };

    if (courseId) {
      query.courseId = new Types.ObjectId(courseId);
    }

    if (sectionId) {
      query.sectionId = new Types.ObjectId(sectionId);
    }

    const quizzes = await this.quizModel
      .find(query)
      .skip(skip)
      .limit(limit)
      .select('-deleteBy')
      .exec();

    const total = await this.quizModel.countDocuments(query);

    return {
      data: quizzes,
      total,
      skip,
      limit,
    };
  }

  /**
   * LẤY CHI TIẾT 1 QUIZ
   */
  async findOne(id: string) {
    const quiz = await this.quizModel.findById(id).exec();

    if (!quiz || quiz.isDeleted) {
      throw new NotFoundException('Không tìm thấy quiz');
    }

    return quiz;
  }

  /**
   * GIÁO VIÊN CẬP NHẬT QUIZ
   */
  async update(id: string, updateQuizDto: UpdateQuizDto, user: IUser) {
    const quiz = await this.findOne(id);

    if (
      updateQuizDto.passScore &&
      updateQuizDto.totalScore &&
      updateQuizDto.passScore > updateQuizDto.totalScore
    ) {
      throw new BadRequestException(
        'Điểm đạt phải nhỏ hơn hoặc bằng tổng điểm',
      );
    }

    Object.assign(quiz, updateQuizDto);
    quiz.updateBy = {
      _id: new Types.ObjectId(user._id),
      email: user.email,
    };

    return await quiz.save();
  }

  /**
   * XÓA QUIZ (SOFT DELETE)
   */
  async remove(id: string, user: IUser) {
    const quiz = await this.findOne(id);

    quiz.isDeleted = true;
    quiz.deletedAt = new Date();
    quiz.deleteBy = {
      _id: new Types.ObjectId(user._id),
      email: user.email,
    };

    return await quiz.save();
  }

  // ========== QUIZ QUESTIONS MANAGEMENT ==========

  /**
   * 4️⃣ GIÁO VIÊN THÊM CÂU HỎI VÀO QUIZ
   * Lựa chọn câu hỏi đã duyệt (approved)
   */
  async addQuestion(createQuizQuestionDto: CreateQuizQuestionDto, user: IUser) {
    // Kiểm tra quiz tồn tại
    const quiz = await this.findOne(createQuizQuestionDto.quizId);

    // Kiểm tra nếu câu hỏi đã có trong quiz rồi
    const existingQuestion = await this.quizQuestionModel.findOne({
      quizId: new Types.ObjectId(createQuizQuestionDto.quizId),
      questionId: new Types.ObjectId(createQuizQuestionDto.questionId),
    });

    if (existingQuestion && !existingQuestion.isDeleted) {
      throw new BadRequestException('Câu hỏi này đã được thêm vào quiz rồi');
    }

    const quizQuestion = new this.quizQuestionModel({
      quizId: new Types.ObjectId(createQuizQuestionDto.quizId),
      questionId: new Types.ObjectId(createQuizQuestionDto.questionId),
      content: createQuizQuestionDto.content,
      options: createQuizQuestionDto.options,
      correctAnswer: createQuizQuestionDto.correctAnswer,
      score: createQuizQuestionDto.score,
      createBy: {
        _id: user._id,
        email: user.email,
      },
    });

    return await quizQuestion.save();
  }

  /**
   * LẤY TẤT CẢ CÂU HỎI TRONG QUIZ
   * Dùng cho HỌC SINH làm bài
   */
  async getQuestions(quizId: string) {
    const questions = await this.quizQuestionModel
      .find({
        quizId: new Types.ObjectId(quizId),
        isDeleted: false,
      })
      .select('-correctAnswer') // Ẩn đáp án đúng khỏi học sinh
      .exec();

    return questions;
  }

  /**
   * LẤY CÂU HỎI VỚI ĐÁP ÁN ĐÚNG (INTERNAL - FOR GRADING)
   * Dùng để chấm bài
   */
  async getQuestionsWithAnswers(quizId: string) {
    const questions = await this.quizQuestionModel
      .find({
        quizId: new Types.ObjectId(quizId),
        isDeleted: false,
      })
      .exec();

    return questions;
  }

  /**
   * XÓA CÂU HỎI KHỎI QUIZ
   */
  async removeQuestion(quizId: string, questionId: string, user: IUser) {
    const quizQuestion = await this.quizQuestionModel.findOne({
      quizId: new Types.ObjectId(quizId),
      questionId: new Types.ObjectId(questionId),
    });

    if (!quizQuestion) {
      throw new NotFoundException('Không tìm thấy câu hỏi trong quiz');
    }

    quizQuestion.isDeleted = true;
    quizQuestion.deletedAt = new Date();
    quizQuestion.deleteBy = {
      _id: new Types.ObjectId(user._id),
      email: user.email,
    };

    return await quizQuestion.save();
  }

  /**
   * INTERNAL: Get quiz details with questions count
   */
  async getQuizWithStats(quizId: string) {
    const quiz = await this.findOne(quizId);
    const questionsCount = await this.quizQuestionModel.countDocuments({
      quizId: new Types.ObjectId(quizId),
      isDeleted: false,
    });

    return {
      ...quiz.toObject(),
      questionsCount,
    };
  }
}
