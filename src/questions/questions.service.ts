import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as mammoth from 'mammoth';
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

  /**
   * Parse câu hỏi từ nội dung text của file Word
   */
  private parseQuestions(text: string) {
    let parseStartIndex = 0;
    const startMarker = /Bắt\s+Đầu\s+Nhập\s+Câu\s+Hỏi/i;
    const markerMatch = text.match(startMarker);
    if (markerMatch && typeof markerMatch.index === 'number') {
      parseStartIndex = markerMatch.index + markerMatch[0].length;
    }

    const textToParse = text.slice(parseStartIndex);
    const lines = textToParse.split('\n');
    const questions: any[] = [];
    let currentQuestion: any = null;
    let currentOptionsMap: Record<string, string> = {};
    let correctAnswerLetter = '';

    const questionRegex = /^(?:Câu|Question)\s+(\d+)\s*:\s*(.*)$/i;
    const optionRegex = /^([A-D])\.\s*(.*)$/i;
    const answerRegex = /^(?:Đáp án|Answer|Correct\s+answer)\s*:\s*([A-D])$/i;
    const scoreRegex = /^(?:Điểm|Score)\s*:\s*(\d+(?:\.\d+)?)$/i;

    for (let line of lines) {
      line = line.trim();
      if (!line) continue;

      const questionMatch = line.match(questionRegex);
      if (questionMatch) {
        if (currentQuestion) {
          if (correctAnswerLetter && currentOptionsMap[correctAnswerLetter]) {
            currentQuestion.correctAnswer = currentOptionsMap[correctAnswerLetter];
          }
          questions.push(currentQuestion);
        }

        const qIndex = parseInt(questionMatch[1]);
        const qContent = questionMatch[2].trim();

        currentQuestion = {
          importIndex: qIndex,
          content: qContent,
          options: [],
          correctAnswer: '',
          score: 1,
        };
        currentOptionsMap = {};
        correctAnswerLetter = '';
        continue;
      }

      if (currentQuestion) {
        const optionMatch = line.match(optionRegex);
        if (optionMatch) {
          const letter = optionMatch[1].toUpperCase();
          const optionText = optionMatch[2].trim();
          currentOptionsMap[letter] = optionText;
          currentQuestion.options.push(optionText);
          continue;
        }

        const answerMatch = line.match(answerRegex);
        if (answerMatch) {
          correctAnswerLetter = answerMatch[1].toUpperCase();
          continue;
        }

        const scoreMatch = line.match(scoreRegex);
        if (scoreMatch) {
          currentQuestion.score = parseFloat(scoreMatch[1]);
          continue;
        }

        // Nếu đang trong block câu hỏi nhưng chưa có options hay đáp án, có thể là câu hỏi nhiều dòng
        if (currentQuestion.options.length === 0 && !correctAnswerLetter) {
          currentQuestion.content += '\n' + line;
        }
      }
    }

    if (currentQuestion) {
      if (correctAnswerLetter && currentOptionsMap[correctAnswerLetter]) {
        currentQuestion.correctAnswer = currentOptionsMap[correctAnswerLetter];
      }
      questions.push(currentQuestion);
    }

    return questions;
  }

  /**
   * Import danh sách câu hỏi từ file Word (.docx)
   */
  async importQuestions(file: Express.Multer.File, user: IUser) {
    if (!file) {
      throw new BadRequestException('Vui lòng tải lên file Word (.docx)');
    }

    const isDocx =
      file.originalname.toLowerCase().endsWith('.docx') ||
      file.mimetype ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    if (!isDocx) {
      throw new BadRequestException(
        'Định dạng file không hợp lệ. Chỉ chấp nhận file Word (.docx)',
      );
    }

    try {
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      const text = result.value;

      const parsedQuestions = this.parseQuestions(text);
      if (parsedQuestions.length === 0) {
        throw new BadRequestException(
          'Không tìm thấy câu hỏi hợp lệ nào trong file Word.',
        );
      }

      const errors: string[] = [];
      const validatedQuestions: any[] = [];

      for (const q of parsedQuestions) {
        const qLabel = `Câu ${q.importIndex}`;

        if (!q.content || !q.content.trim()) {
          errors.push(`${qLabel}: Nội dung câu hỏi không được để trống.`);
          continue;
        }

        if (q.options.length < 2 || q.options.length > 4) {
          errors.push(
            `${qLabel}: Số lượng lựa chọn phải từ 2 đến 4 (hiện có ${q.options.length} lựa chọn).`,
          );
          continue;
        }

        if (!q.correctAnswer) {
          errors.push(
            `${qLabel}: Thiếu đáp án đúng hoặc đáp án đúng không khớp với bất kỳ lựa chọn A, B, C, D nào.`,
          );
          continue;
        }

        validatedQuestions.push({
          content: q.content,
          options: q.options,
          correctAnswer: q.correctAnswer,
          score: q.score || 1,
          status: 'pending',
          createBy: {
            _id: new Types.ObjectId(user._id),
            email: user.email,
          },
        });
      }

      if (errors.length > 0) {
        throw new BadRequestException({
          message: 'File Word chứa dữ liệu không hợp lệ',
          errors,
        });
      }

      const saved = await this.questionModel.insertMany(validatedQuestions);

      return {
        message: `Import thành công ${saved.length} câu hỏi!`,
        count: saved.length,
        data: saved,
      };
    } catch (err) {
      if (err instanceof BadRequestException) {
        throw err;
      }
      throw new BadRequestException(
        'Có lỗi xảy ra trong quá trình parse file Word: ' + err.message,
      );
    }
  }
}
