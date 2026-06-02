import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/user/schemas/user.schema';
import { Role, RoleSchema } from 'src/role/schemas/role.schema';
import { Course, CourseSchema } from 'src/courses/schemas/course.schema';
import { Payment, PaymentSchema } from 'src/payments/schemas/payment.schema';
import {
  Enrollment,
  EnrollmentSchema,
} from 'src/enrollments/schemas/enrollment.schema';
import { Lesson, LessonSchema } from 'src/lessons/schemas/lesson.schema';
import {
  CourseProgress,
  CourseProgressSchema,
} from 'src/tracking/schemas/course-progress.schema';
import {
  LessonProgress,
  LessonProgressSchema,
} from 'src/tracking/schemas/lesson-progress.schema';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Role.name, schema: RoleSchema },
      { name: Course.name, schema: CourseSchema },
      { name: Payment.name, schema: PaymentSchema },
      { name: Enrollment.name, schema: EnrollmentSchema },
      { name: Lesson.name, schema: LessonSchema },
      { name: CourseProgress.name, schema: CourseProgressSchema },
      { name: LessonProgress.name, schema: LessonProgressSchema },
    ]),
  ],
  controllers: [StatisticsController],
  providers: [StatisticsService],
  exports: [StatisticsService],
})
export class StatisticsModule {}
