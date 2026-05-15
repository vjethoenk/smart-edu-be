import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Tracking, TrackingSchema } from 'src/lessons/schemas/tracking.schema';
import { Lesson, LessonSchema } from 'src/lessons/schemas/lesson.schema';
import { Course, CourseSchema } from 'src/courses/schemas/course.schema';
import {
  Enrollment,
  EnrollmentSchema,
} from 'src/enrollments/schemas/enrollment.schema';
import { Quiz, QuizSchema } from 'src/quizzes/schemas/quiz.schema';
import {
  LessonProgress,
  LessonProgressSchema,
} from './schemas/lesson-progress.schema';
import {
  CourseProgress,
  CourseProgressSchema,
} from './schemas/course-progress.schema';
import { TrackingController } from './tracking.controller';
import { TrackingService } from './tracking.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Tracking.name, schema: TrackingSchema },
      { name: LessonProgress.name, schema: LessonProgressSchema },
      { name: CourseProgress.name, schema: CourseProgressSchema },
      { name: Lesson.name, schema: LessonSchema },
      { name: Course.name, schema: CourseSchema },
      { name: Enrollment.name, schema: EnrollmentSchema },
      { name: Quiz.name, schema: QuizSchema },
    ]),
  ],
  controllers: [TrackingController],
  providers: [TrackingService],
  exports: [TrackingService],
})
export class TrackingModule {}
