import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  Inject,
} from '@nestjs/common';
import { AttemptsService } from './attempts.service';
import { CreateAttemptDto } from './dto/create-attempt.dto';
import { SubmitAttemptDto } from './dto/submit-attempt.dto';
import { ResponseMessage, User } from 'src/decorator/customize';
import type { IUser } from 'src/user/user.interface';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AttemptAnswersService } from 'src/attempt-answers/attempt-answers.service';
import { QuizzesService } from 'src/quizzes/quizzes.service';

@Controller('attempts')
@UseGuards(JwtAuthGuard)
export class AttemptsController {
  constructor(
    private readonly attemptsService: AttemptsService,
    @Inject(AttemptAnswersService)
    private readonly attemptAnswersService: AttemptAnswersService,
    @Inject(QuizzesService)
    private readonly quizzesService: QuizzesService,
  ) {}

  /**
   * 2️⃣ HỌC SINH BẮT ĐẦU LÀM BÀI QUIZ
   * POST /attempts
   * Body: { quizId }
   * Returns: attemptId, questions[], timeLimit
   */
  @Post()
  @ResponseMessage('Bắt đầu làm bài quiz thành công!')
  async create(
    @Body() createAttemptDto: CreateAttemptDto,
    @User() user: IUser,
  ) {
    // Tạo Attempt record
    const attempt = await this.attemptsService.create(
      createAttemptDto,
      user._id.toString(),
    );

    // Lấy các câu hỏi (không hiển thị đáp án)
    const questions = await this.quizzesService.getQuestions(
      createAttemptDto.quizId,
    );

    // Lấy thông tin quiz
    const quiz = await this.quizzesService.findOne(createAttemptDto.quizId);

    return {
      attemptId: attempt._id,
      quizId: quiz._id,
      title: quiz.title,
      description: quiz.description,
      limitTime: quiz.limitTime, // số giây
      passScore: quiz.passScore,
      totalScore: quiz.totalScore,
      questionsCount: questions.length,
      questions: questions.map((q: any) => ({
        _id: q._id,
        questionId: q.questionId,
        content: q.content,
        options: q.options,
        score: q.score,
      })),
    };
  }

  /**
   * 📝 HỌC SINH LƯU 1 CÂU TRẢ LỜI (REAL-TIME)
   * POST /attempts/:attemptId/answers
   * Body: { questionId, selectedAnswer }
   */
  @Post(':attemptId/answers')
  @ResponseMessage('Lưu câu trả lời thành công!')
  async saveAnswer(
    @Param('attemptId') attemptId: string,
    @Body() body: { questionId: string; selectedAnswer: string },
  ) {
    // Validate attempt exists
    if (!(await this.attemptsService.attemptExists(attemptId))) {
      throw new Error('Lần làm bài không tồn tại');
    }

    // TODO: Get correctAnswer từ QuizQuestion để kiểm tra
    // Tạm thời: chỉ lưu, không check
    const answer = await this.attemptAnswersService.create(
      {
        attemptId,
        questionId: body.questionId,
        selectedAnswer: body.selectedAnswer,
      } as any,
      '', // correctAnswer sẽ được fetch từ DB
    );

    return answer;
  }

  /**
   * ✅ HỌC SINH NỘP BÀI QUIZ
   * PATCH /attempts/:attemptId/submit
   * Returns: score, passStatus, results
   */
  @Patch(':attemptId/submit')
  @ResponseMessage('Nộp bài quiz thành công!')
  async submit(@Param('attemptId') attemptId: string, @User() user: IUser) {
    // Lấy Attempt
    const attempt = await this.attemptsService.findOne(attemptId);

    // Lấy Quiz để lấy thông tin cần thiết
    const quiz = await this.quizzesService.findOne(attempt.quizId.toString());

    // Lấy tất cả câu hỏi trong quiz (với đáp án)
    const quizQuestions = await this.quizzesService.getQuestionsWithAnswers(
      attempt.quizId.toString(),
    );

    // Tính điểm từ các câu trả lời
    const gradeResult =
      await this.attemptAnswersService.gradeAttempt(attemptId);

    // Cập nhật Attempt: endTime, score, status
    const submittedAttempt = await this.attemptsService.submit(
      attemptId,
      gradeResult.totalScore,
    );

    // Cập nhật tổng điểm
    await this.attemptsService.updateScore(attemptId, gradeResult.totalScore);

    // Xác định pass/fail
    const isPassed = gradeResult.totalScore >= quiz.passScore;

    return {
      attemptId: submittedAttempt._id,
      quizId: quiz._id,
      title: quiz.title,
      submitTime: submittedAttempt.endTime,
      totalScore: gradeResult.totalScore,
      totalQuestions: gradeResult.totalQuestions,
      correctCount: gradeResult.correctCount,
      incorrectCount: gradeResult.incorrectCount,
      passScore: quiz.passScore,
      isPassed,
      status: 'HOÀN THÀNH',
      message: isPassed
        ? `Chúc mừng! Bạn đã đạt được ${gradeResult.totalScore}/${quiz.totalScore} điểm`
        : `Bạn cần đạt ${quiz.passScore} điểm, nhưng bạn chỉ có ${gradeResult.totalScore} điểm`,
      details: gradeResult.details,
    };
  }

  /**
   * 📊 HỌC SINH XEM KẾT QUẢ BÀI LÀM
   * GET /attempts/:attemptId/result
   */
  @Get(':attemptId/result')
  @ResponseMessage('Lấy kết quả bài làm thành công!')
  async getResult(@Param('attemptId') attemptId: string) {
    const attempt = await this.attemptsService.findOne(attemptId);
    const quiz = await this.quizzesService.findOne(attempt.quizId.toString());

    const gradeResult =
      await this.attemptAnswersService.gradeAttempt(attemptId);

    const isPassed = attempt.score >= quiz.passScore;

    return {
      attemptId: attempt._id,
      quizTitle: quiz.title,
      startTime: attempt.startTime,
      endTime: attempt.endTime,
      totalScore: attempt.score,
      passScore: quiz.passScore,
      totalQuestions: gradeResult.totalQuestions,
      correctCount: gradeResult.correctCount,
      incorrectCount: gradeResult.incorrectCount,
      isPassed,
      status: attempt.status,
    };
  }

  /**
   * 📋 HỌC SINH XEM CÁC LẦN LÀM BÀI
   * GET /attempts?quizId=xxx&skip=0&limit=10
   */
  @Get()
  @ResponseMessage('Lấy danh sách lần làm bài thành công!')
  findUserAttempts(
    @User() user: IUser,
    @Query('quizId') quizId?: string,
    @Query('skip') skip?: string,
    @Query('limit') limit?: string,
  ) {
    return this.attemptsService.findUserAttempts(
      user._id.toString(),
      quizId,
      parseInt(skip || '0'),
      parseInt(limit || '10'),
    );
  }

  /**
   * LẤY CHI TIẾT 1 LẦN LÀM BÀI
   * GET /attempts/:id
   */
  @Get(':id')
  @ResponseMessage('Lấy chi tiết lần làm bài thành công!')
  findOne(@Param('id') id: string) {
    return this.attemptsService.findOne(id);
  }
}
