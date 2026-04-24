import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { QuizzesService } from './quizzes.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { CreateQuizQuestionDto } from './dto/create-quiz-question.dto';
import { ResponseMessage, User } from 'src/decorator/customize';
import type { IUser } from 'src/user/user.interface';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('quizzes')
@UseGuards(JwtAuthGuard)
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  /**
   * 3️⃣ GIÁO VIÊN TẠO QUIZ
   * POST /quizzes
   */
  @Post()
  @ResponseMessage('Tạo quiz thành công!')
  create(@Body() createQuizDto: CreateQuizDto, @User() user: IUser) {
    return this.quizzesService.create(createQuizDto, user);
  }

  /**
   * LẤY DANH SÁCH QUIZ
   * GET /quizzes?courseId=xxx&sectionId=yyy&skip=0&limit=10
   */
  @Get()
  @ResponseMessage('Lấy danh sách quiz thành công!')
  findAll(
    @Query('courseId') courseId?: string,
    @Query('sectionId') sectionId?: string,
    @Query('skip') skip?: string,
    @Query('limit') limit?: string,
  ) {
    return this.quizzesService.findAll(
      courseId,
      sectionId,
      parseInt(skip || '0'),
      parseInt(limit || '10'),
    );
  }

  /**
   * LẤY CHI TIẾT QUIZ
   * GET /quizzes/:id
   */
  @Get(':id')
  @ResponseMessage('Lấy chi tiết quiz thành công!')
  findOne(@Param('id') id: string) {
    return this.quizzesService.findOne(id);
  }

  /**
   * GIÁO VIÊN CHỈNH SỬA QUIZ
   * PATCH /quizzes/:id
   */
  @Patch(':id')
  @ResponseMessage('Cập nhật quiz thành công!')
  update(
    @Param('id') id: string,
    @Body() updateQuizDto: UpdateQuizDto,
    @User() user: IUser,
  ) {
    return this.quizzesService.update(id, updateQuizDto, user);
  }

  /**
   * XÓA QUIZ
   * DELETE /quizzes/:id
   */
  @Delete(':id')
  @ResponseMessage('Xóa quiz thành công!')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.quizzesService.remove(id, user);
  }

  // ========== QUIZ QUESTIONS MANAGEMENT ==========

  /**
   * 4️⃣ THÊM CÂU HỎI VÀO QUIZ
   * POST /quizzes/:quizId/questions
   * Body: { questionId, content, options[], correctAnswer, score }
   */
  @Post(':quizId/questions')
  @ResponseMessage('Thêm câu hỏi vào quiz thành công!')
  addQuestion(
    @Param('quizId') quizId: string,
    @Body() createQuizQuestionDto: CreateQuizQuestionDto,
    @User() user: IUser,
  ) {
    const dto = {
      ...createQuizQuestionDto,
      quizId,
    };
    return this.quizzesService.addQuestion(dto, user);
  }

  /**
   * LẤY CÂU HỎI TRONG QUIZ (CHO HỌC SINH)
   * GET /quizzes/:quizId/questions
   * Không hiển thị đáp án đúng
   */
  @Get(':quizId/questions')
  @ResponseMessage('Lấy danh sách câu hỏi thành công!')
  getQuestions(@Param('quizId') quizId: string) {
    return this.quizzesService.getQuestions(quizId);
  }

  /**
   * XÓA CÂU HỎI KHỎI QUIZ
   * DELETE /quizzes/:quizId/questions/:questionId
   */
  @Delete(':quizId/questions/:questionId')
  @ResponseMessage('Xóa câu hỏi khỏi quiz thành công!')
  removeQuestion(
    @Param('quizId') quizId: string,
    @Param('questionId') questionId: string,
    @User() user: IUser,
  ) {
    return this.quizzesService.removeQuestion(quizId, questionId, user);
  }
}
