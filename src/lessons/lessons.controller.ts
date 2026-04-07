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
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import type { IUser } from 'src/user/user.interface';

@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Post()
  @ResponseMessage('Thêm bài học thành công!')
  create(@Body() createLessonDto: CreateLessonDto, @User() user: IUser) {
    return this.lessonsService.create(createLessonDto, user);
  }

  @Get()
  @Public()
  @ResponseMessage('Hiển thị danh sách bài học thành công!')
  findAll() {
    return this.lessonsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.lessonsService.findOne(id);
  }

  @Put(':id')
  @ResponseMessage('Cập nhật bài học thành công!')
  update(
    @Param('id') id: string,
    @Body() updateLessonDto: UpdateLessonDto,
    @User() user: IUser,
  ) {
    return this.lessonsService.update(id, updateLessonDto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.lessonsService.remove(id);
  }
}
