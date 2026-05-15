import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { CreateTrackingDto } from './dto/create-tracking.dto';
import { User } from 'src/decorator/customize';
import type { IUser } from 'src/user/user.interface';
import { TrackingService } from './tracking.service';

@Controller('tracking')
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @Post()
  async create(
    @Body() createTrackingDto: CreateTrackingDto,
    @User() user: IUser,
  ) {
    return this.trackingService.create(createTrackingDto, user);
  }

  @Get('lesson-progress/:lessonId')
  async getLessonProgress(
    @Param('lessonId') lessonId: string,
    @User() user: IUser,
  ) {
    return this.trackingService.getLessonProgress(user, lessonId);
  }

  @Get('course-progress/:courseId')
  async getCourseProgress(
    @Param('courseId') courseId: string,
    @User() user: IUser,
  ) {
    return this.trackingService.getCourseProgress(user, courseId);
  }
}
