import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateTrackingDto } from './dto/create-tracking.dto';
import {
  Tracking,
  TrackingDocument,
} from 'src/lessons/schemas/tracking.schema';
import { Lesson, LessonDocument } from 'src/lessons/schemas/lesson.schema';
import {
  Enrollment,
  EnrollmentDocument,
} from 'src/enrollments/schemas/enrollment.schema';
import { Quiz, QuizDocument } from 'src/quizzes/schemas/quiz.schema';
import {
  LessonProgress,
  LessonProgressDocument,
} from './schemas/lesson-progress.schema';
import {
  CourseProgress,
  CourseProgressDocument,
} from './schemas/course-progress.schema';
import { TrackingEvent } from './enums/tracking-event.enum';
import { TrackingItemType } from './enums/item-type.enum';
import { IUser } from 'src/user/user.interface';
import {
  WatchedRange,
  mergeWatchedRanges,
  calculateWatchedSeconds,
  getProgressPercent,
} from './utils/progress.util';

const MIN_VIDEO_COMPLETE_PERCENT = 80;
const MAX_VIDEO_HEARTBEAT_DELTA_SECONDS = 30;
const MAX_PDF_HEARTBEAT_DELTA_SECONDS = 30;

@Injectable()
export class TrackingService {
  constructor(
    @InjectModel(Tracking.name)
    private readonly trackingModel: Model<TrackingDocument>,
    @InjectModel(LessonProgress.name)
    private readonly lessonProgressModel: Model<LessonProgressDocument>,
    @InjectModel(CourseProgress.name)
    private readonly courseProgressModel: Model<CourseProgressDocument>,
    @InjectModel(Lesson.name)
    private readonly lessonModel: Model<LessonDocument>,
    @InjectModel(Enrollment.name)
    private readonly enrollmentModel: Model<EnrollmentDocument>,
    @InjectModel(Quiz.name)
    private readonly quizModel: Model<QuizDocument>,
  ) { }

  async create(createTrackingDto: CreateTrackingDto, user: IUser) {
    const lesson = await this.lessonModel
      .findById(createTrackingDto.lessonId)
      .exec();
    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    this.validateItemType(createTrackingDto.itemType, lesson.type);
    await this.validateEnrollment(user._id, lesson.courseId);

    const lessonProgress = await this.getOrCreateLessonProgress(
      user,
      lesson,
      createTrackingDto.itemType,
    );

    const updatedProgress = await this.handleTrackingEvent(
      lessonProgress,
      lesson,
      createTrackingDto,
    );

    await this.saveRawTracking(createTrackingDto, user._id, lesson._id);

    if (updatedProgress.isCompleted) {
      await Promise.all([
        this.recalculateCourseProgress(user._id, lesson.courseId),
      ]);
    }

    return {
      lessonProgress: updatedProgress,
    };
  }

  private validateItemType(itemType: TrackingItemType, lessonType: string) {
    if (!lessonType || lessonType.toLowerCase() !== itemType) {
      throw new BadRequestException(
        `Lesson type must match itemType (${itemType})`,
      );
    }
  }

  private async validateEnrollment(userId: string, courseId: Types.ObjectId) {
    // console.log(
    //   'Validating enrollment for user',
    //   userId,
    //   'and course',
    //   courseId,
    // );
    const enrolled = await this.enrollmentModel
      .findOne({
        userId: userId,
        courseId: courseId.toString(),
        status: 'ACTIVE',
      })
      .exec();

    if (!enrolled) {
      throw new ForbiddenException('User is not enrolled in this course');
    }
  }

  private async getOrCreateLessonProgress(
    user: IUser,
    lesson: LessonDocument,
    itemType: TrackingItemType,
  ) {
    const existingProgress = await this.lessonProgressModel
      .findOne({
        userId: new Types.ObjectId(user._id),
        lessonId: lesson._id,
        itemType,
      })
      .exec();

    if (existingProgress) {
      return existingProgress;
    }

    const totalDuration = this.deriveLessonDuration(lesson, itemType);

    return this.lessonProgressModel.create({
      userId: new Types.ObjectId(user._id),
      lessonId: lesson._id,
      courseId: lesson.courseId,
      itemType,
      totalDuration,
      watchedRanges: [],
      watchedSeconds: 0,
      lastPosition: 0,
      progressPercent: 0,
      isCompleted: false,
    });
  }

  private deriveLessonDuration(
    lesson: LessonDocument,
    itemType: TrackingItemType,
  ) {
    if (itemType === TrackingItemType.VIDEO) {
      return lesson.completionConditions?.duration ?? 0;
    }

    if (itemType === TrackingItemType.PDF) {
      return (
        lesson.completionConditions?.requiredReadingTime ??
        lesson.completionConditions?.duration ??
        0
      );
    }

    return 0;
  }

  private getVideoCompletePercent(lesson: LessonDocument) {
    return (
      lesson.completionConditions?.minWatchPercent ?? MIN_VIDEO_COMPLETE_PERCENT
    );
  }

  private getPdfRequiredReadingTime(lesson: LessonDocument) {
    return (
      lesson.completionConditions?.requiredReadingTime ??
      lesson.completionConditions?.duration ??
      0
    );
  }

  private async handleTrackingEvent(
    lessonProgress: LessonProgressDocument,
    lesson: LessonDocument,
    dto: CreateTrackingDto,
  ) {
    lessonProgress.startedAt ||= new Date();

    switch (dto.itemType) {
      case TrackingItemType.VIDEO:
        await this.processVideoTracking(lessonProgress, lesson, dto);
        break;
      case TrackingItemType.PDF:
        await this.processPdfTracking(lessonProgress, lesson, dto);
        break;
      case TrackingItemType.QUIZ:
        await this.processQuizTracking(lessonProgress, lesson, dto);
        break;
      default:
        throw new BadRequestException('Invalid tracking item type');
    }

    await lessonProgress.save();
    return lessonProgress;
  }

  private async processVideoTracking(
    progress: LessonProgressDocument,
    lesson: LessonDocument,
    dto: CreateTrackingDto,
  ) {
    const totalDuration = this.deriveLessonDuration(
      lesson,
      TrackingItemType.VIDEO,
    );
    if (!totalDuration) {
      throw new BadRequestException(
        'Video duration is required for video tracking',
      );
    }

    if (dto.currentTime === undefined) {
      if (
        dto.event === TrackingEvent.OPEN ||
        dto.event === TrackingEvent.CLOSE
      ) {
        return;
      }
      throw new BadRequestException(
        'currentTime is required for video tracking',
      );
    }

    const currentTime = this.normalizeCurrentTime(
      dto.currentTime,
      totalDuration,
    );
    const lastPosition = progress.lastPosition ?? 0;

    if (
      [
        TrackingEvent.HEARTBEAT,
        TrackingEvent.PAUSE,
        TrackingEvent.END,
      ].includes(dto.event)
    ) {
      const start =
        lastPosition > 0 ? lastPosition : Math.max(0, currentTime - 10);
      const range = this.buildValidRange(start, currentTime);
      if (range) {
        progress.watchedRanges = mergeWatchedRanges(
          progress.watchedRanges,
          range,
        );
      }
    }

    if (dto.event === TrackingEvent.SEEK || dto.event === TrackingEvent.PLAY) {
      progress.lastPosition = currentTime;
    }

    if (
      [
        TrackingEvent.HEARTBEAT,
        TrackingEvent.PAUSE,
        TrackingEvent.END,
      ].includes(dto.event)
    ) {
      progress.lastPosition = currentTime;
    }

    progress.watchedSeconds = calculateWatchedSeconds(progress.watchedRanges);
    progress.progressPercent = getProgressPercent(
      progress.watchedSeconds,
      totalDuration,
    );

    const completePercent = this.getVideoCompletePercent(lesson);
    if (
      dto.event === TrackingEvent.END ||
      progress.progressPercent >= completePercent
    ) {
      progress.isCompleted = true;
      progress.completedAt ||= new Date();
    }
  }

  private async processPdfTracking(
    progress: LessonProgressDocument,
    lesson: LessonDocument,
    dto: CreateTrackingDto,
  ) {
    const requiredReadingTime = this.getPdfRequiredReadingTime(lesson);
    if (!requiredReadingTime) {
      throw new BadRequestException(
        'Required reading time is missing for PDF tracking',
      );
    }

    if (dto.currentTime === undefined) {
      if (
        dto.event === TrackingEvent.OPEN ||
        dto.event === TrackingEvent.CLOSE
      ) {
        return;
      }
      throw new BadRequestException(
        'currentTime is required for pdf heartbeat',
      );
    }

    const currentTime = Math.max(0, dto.currentTime);
    const delta = currentTime - (progress.lastPosition ?? 0);
    if (delta <= 0) {
      return;
    }

    if (delta > MAX_PDF_HEARTBEAT_DELTA_SECONDS) {
      throw new BadRequestException('Heartbeat delta for PDF is too large');
    }

    progress.watchedSeconds += delta;
    progress.lastPosition = currentTime;
    progress.progressPercent = getProgressPercent(
      progress.watchedSeconds,
      requiredReadingTime,
    );

    if (progress.watchedSeconds >= requiredReadingTime) {
      progress.isCompleted = true;
      progress.completedAt ||= new Date();
    }
  }

  private async processQuizTracking(
    progress: LessonProgressDocument,
    lesson: LessonDocument,
    dto: CreateTrackingDto,
  ) {
    if (dto.event === TrackingEvent.START) {
      progress.startedAt ||= new Date();
      return;
    }
  }

  private normalizeCurrentTime(currentTime: number, totalDuration: number) {
    if (currentTime < 0) {
      throw new BadRequestException('currentTime must be positive');
    }
    if (currentTime > totalDuration + MAX_VIDEO_HEARTBEAT_DELTA_SECONDS) {
      throw new BadRequestException('currentTime exceeds lesson duration');
    }
    return Math.min(currentTime, totalDuration);
  }

  private buildValidRange(start: number, end: number): WatchedRange | null {
    if (end <= start) {
      return null;
    }
    return { start, end };
  }

  private async saveRawTracking(
    dto: CreateTrackingDto,
    userId: string,
    lessonId: Types.ObjectId,
  ) {
    await this.trackingModel.create({
      ...dto,
      lessonId,
      userId: new Types.ObjectId(userId),
    } as any);
  }

  private async recalculateCourseProgress(
    userId: string,
    courseId: Types.ObjectId,
  ) {
    const totalLessons = await this.lessonModel
      .countDocuments({ courseId, isDeleted: false })
      .exec();

    const completedLessons = await this.lessonProgressModel
      .countDocuments({
        userId: new Types.ObjectId(userId),
        $or: [
          { courseId: new Types.ObjectId(courseId) },
          { courseId: courseId.toString() }
        ],
        isCompleted: true,
      })
      .exec();

    const progressPercent = totalLessons
      ? Math.min(
        100,
        Math.round((completedLessons / totalLessons) * 100 * 100) / 100,
      )
      : 0;

    await this.courseProgressModel
      .findOneAndUpdate(
        { userId: new Types.ObjectId(userId), courseId },
        {
          userId: new Types.ObjectId(userId),
          courseId,
          totalLessons,
          completedLessons,
          progressPercent,
          completedAt: progressPercent === 100 ? new Date() : null,
        },
        { upsert: true, new: true },
      )
      .exec();
  }

  async getLessonProgress(user: IUser, lessonId: string) {
    const lessonProgress = await this.lessonProgressModel
      .findOne({
        userId: new Types.ObjectId(user._id),
        lessonId: new Types.ObjectId(lessonId),
      })
      .exec();

    if (!lessonProgress) {
      throw new NotFoundException('Lesson progress not found');
    }

    return lessonProgress;
  }

  async getCourseProgress(user: IUser, courseId: string) {
    const courseProgress = await this.courseProgressModel
      .findOne({
        userId: new Types.ObjectId(user._id),
        courseId: courseId,
      })
      .exec();

    if (!courseProgress) {
      throw new NotFoundException('Course progress not found');
    }

    return courseProgress;
  }

  async markQuizCompletedForUser(userId: string, quizId: string) {
    const lesson = await this.lessonModel.findOne({ quizId }).exec();
    if (!lesson) {
      return;
    }

    const filter = {
      userId: new Types.ObjectId(userId),
      lessonId: lesson._id,
      itemType: TrackingItemType.QUIZ,
    };

    const update = {
      $set: {
        progressPercent: 100,
        isCompleted: true,
        completedAt: new Date(),
      },
      $setOnInsert: {
        courseId: lesson.courseId,
      },
    };

    const test = await this.lessonProgressModel
      .findOneAndUpdate(filter, update, {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      })
      .exec();

    await this.recalculateCourseProgress(userId, lesson.courseId);
    return test;
  }
}
