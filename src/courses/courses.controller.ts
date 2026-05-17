import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import type { IUser } from 'src/user/user.interface';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @ResponseMessage('Thêm khóa học thành công!')
  create(@Body() createCourseDto: CreateCourseDto, @User() user: IUser) {
    return this.coursesService.create(createCourseDto, user);
  }

  @Get()
  @Public()
  @ResponseMessage('Hiển thị danh sách khóa học thành công!')
  findAll() {
    return this.coursesService.findAll();
  }

  @Get('stats/purchase')
  @Public()
  @ResponseMessage('Lấy thống kê mua hàng thành công!')
  getPurchaseStats() {
    return this.coursesService.getPurchaseStats();
  }

  @Get('stats/total-students')
  @Public()
  @ResponseMessage('Lấy tổng số học sinh đã mua thành công!')
  getTotalStudentsPurchased() {
    return this.coursesService.getTotalStudentsPurchased();
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  @Put(':id')
  @ResponseMessage('Cập nhật khóa học thành công!')
  update(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
    @User() user: IUser,
  ) {
    return this.coursesService.update(id, updateCourseDto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.coursesService.remove(id);
  }

  @Get(':id/monitoring')
  @ResponseMessage('Lấy dữ liệu giám sát khóa học thành công!')
  monitoring(@Param('id') id: string, @User() user: IUser) {
    return this.coursesService.monitoring(id, user);
  }

  @Get(':id/purchase-count')
  @Public()
  @ResponseMessage('Lấy số lượng mua khóa học thành công!')
  getPurchaseCount(@Param('id') id: string) {
    return this.coursesService.getPurchaseCount(id);
  }

  @Put('approval/:id')
  @ResponseMessage('Thay đổi phê duyệt thành công!')
  approvals(
    @Param('id') id: string,
    @Body('status') status: string,
    @User() user: IUser,
  ) {
    return this.coursesService.updateApproval(id, status, user);
  }
}
