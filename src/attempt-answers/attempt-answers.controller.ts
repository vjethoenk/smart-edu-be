import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AttemptAnswersService } from './attempt-answers.service';
import { CreateAttemptAnswerDto } from './dto/create-attempt-answer.dto';
import { SubmitAnswersDto } from './dto/submit-answers.dto';
import { ResponseMessage, User } from 'src/decorator/customize';
import type { IUser } from 'src/user/user.interface';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { QuizzesService } from 'src/quizzes/quizzes.service';
import { Inject } from '@nestjs/common';

@Controller('attempt-answers')
@UseGuards(JwtAuthGuard)
export class AttemptAnswersController {
  constructor(
    private readonly attemptAnswersService: AttemptAnswersService,
    @Inject(QuizzesService)
    private readonly quizzesService: QuizzesService,
  ) {}

  /**
   * 💾 HỌC SINH LƯU TẤT CẢ CÂU TRẢ LỜI (KHI NỘP BÀI)
   * POST /attempt-answers/submit-batch
   * Body: { attemptId, answers: [{questionId, selectedAnswer}, ...] }
   */
  @Post('submit-batch')
  @ResponseMessage('Lưu tất cả câu trả lời thành công!')
  async submitBatch(
    @Body()
    body: {
      attemptId: string;
      quizId: string;
      answers: Array<{ questionId: string; selectedAnswer: string }>;
    },
    @User() user: IUser,
  ) {}

  /**
   * 📝 HỌC SINH LƯU 1 CÂU TRẢ LỜI (REAL-TIME)
   * POST /attempt-answers
   * Body: { attemptId, questionId, selectedAnswer, correctAnswer }
   */
  @Post()
  @ResponseMessage('Lưu câu trả lời thành công!')
  async create(
    @Body()
    body: {
      attemptId: string;
      questionId: string;
      selectedAnswer: string;
      correctAnswer: string;
    },
    @User() user: IUser,
  ) {
    return await this.attemptAnswersService.create(
      {
        attemptId: body.attemptId,
        questionId: body.questionId,
        selectedAnswer: body.selectedAnswer,
      } as CreateAttemptAnswerDto,
      body.correctAnswer,
    );
  }

  /**
   * 📋 LẤY TẤT CẢ CÂU TRẢ LỜI CỦA 1 LẦN LÀM BÀI
   * GET /attempt-answers/attempt/:attemptId
   */
  @Get('attempt/:attemptId')
  @ResponseMessage('Lấy danh sách câu trả lời thành công!')
  findByAttempt(@Param('attemptId') attemptId: string) {
    return this.attemptAnswersService.findByAttempt(attemptId);
  }

  /**
   * LẤY CHI TIẾT 1 CÂU TRẢ LỜI
   * GET /attempt-answers/:id
   */
  @Get(':id')
  @ResponseMessage('Lấy chi tiết câu trả lời thành công!')
  findOne(@Param('id') id: string) {
    return this.attemptAnswersService.findOne(id);
  }
}
