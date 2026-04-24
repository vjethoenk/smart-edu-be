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
  Put,
} from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { ApproveQuestionDto } from './dto/approve-question.dto';
import { ResponseMessage, User } from 'src/decorator/customize';
import type { IUser } from 'src/user/user.interface';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('questions')
@UseGuards(JwtAuthGuard)
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  /**
   * 1️⃣ GIÁO VIÊN TẠO CÂU HỎI
   * POST /questions
   * Body: { content, options[], correctAnswer, score }
   * Status tự động: "pending"
   */
  @Post()
  @ResponseMessage('Tạo câu hỏi thành công!')
  create(@Body() createQuestionDto: CreateQuestionDto, @User() user: IUser) {
    return this.questionsService.create(createQuestionDto, user);
  }

  /**
   * LẤY TOÀN BỘ CÂU HỎI (CÓ FILTER)
   * GET /questions?status=pending&skip=0&limit=10
   */
  @Get()
  @ResponseMessage('Lấy danh sách câu hỏi thành công!')
  findAll(
    @Query('status') status?: string,
    @Query('skip') skip?: string,
    @Query('limit') limit?: string,
  ) {
    return this.questionsService.findAll(
      status,
      parseInt(skip || '0'),
      parseInt(limit || '10'),
    );
  }

  @Put('approval/:id')
  @ResponseMessage('Thay đổi phê duyệt câu hỏi thành công!')
  approvals(
    @Param('id') id: string,
    @Body('status') status: string,
    @User() user: IUser,
  ) {
    return this.questionsService.updateApproval(id, status, user);
  }

  /**
   * LẤY CÂU HỎI ĐÃ DUYỆT
   * GET /questions/approved/list
   * Dùng khi thêm câu hỏi vào quiz
   */
  @Get('approved/list')
  @ResponseMessage('Lấy câu hỏi đã duyệt thành công!')
  findApproved(@Query('skip') skip?: string, @Query('limit') limit?: string) {
    return this.questionsService.findApproved(
      parseInt(skip || '0'),
      parseInt(limit || '10'),
    );
  }

  /**
   * LẤY CHI TIẾT 1 CÂU HỎI
   * GET /questions/:id
   */
  @Get(':id')
  @ResponseMessage('Lấy chi tiết câu hỏi thành công!')
  findOne(@Param('id') id: string) {
    return this.questionsService.findOne(id);
  }

  /**
   * 2️⃣ ADMIN DUYỆT CÂU HỎI
   * PATCH /questions/:id/approve
   * Body: { status: "pending" | "approved" | "rejected" }
   */
  @Put(':id/approve')
  @ResponseMessage('Duyệt câu hỏi thành công!')
  approve(
    @Param('id') id: string,
    @Body() approveQuestionDto: ApproveQuestionDto,
    @User() user: IUser,
  ) {
    return this.questionsService.approve(id, approveQuestionDto, user);
  }

  /**
   * GIÁO VIÊN CHỈNH SỬA CÂU HỎI
   * PATCH /questions/:id
   */
  @Patch(':id')
  @ResponseMessage('Cập nhật câu hỏi thành công!')
  update(
    @Param('id') id: string,
    @Body() updateQuestionDto: UpdateQuestionDto,
    @User() user: IUser,
  ) {
    return this.questionsService.update(id, updateQuestionDto, user);
  }

  /**
   * XÓA CÂU HỎI (SOFT DELETE)
   * DELETE /questions/:id
   */
  @Delete(':id')
  @ResponseMessage('Xóa câu hỏi thành công!')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.questionsService.remove(id, user);
  }
}
