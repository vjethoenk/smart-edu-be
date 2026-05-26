import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { IUser } from 'src/user/user.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Course, CourseDocument } from './schemas/course.schema';
import { Section, SectionDocument } from 'src/sections/schemas/section.schema';
import { Lesson, LessonDocument } from 'src/lessons/schemas/lesson.schema';
import {
  Enrollment,
  EnrollmentDocument,
} from 'src/enrollments/schemas/enrollment.schema';
import {
  CourseProgress,
  CourseProgressDocument,
} from 'src/tracking/schemas/course-progress.schema';
import { Model, Types } from 'mongoose';
import type {
  ICourseMonitoring,
  ICourseMonitoringStudent,
} from './interfaces/course-monitoring.interface';

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectModel(Section.name) private sectionModel: Model<SectionDocument>,
    @InjectModel(Lesson.name) private lessonModel: Model<LessonDocument>,
    @InjectModel(Enrollment.name)
    private enrollmentModel: Model<EnrollmentDocument>,
    @InjectModel(CourseProgress.name)
    private courseProgressModel: Model<CourseProgressDocument>,
  ) {}
  async create(createCourseDto: CreateCourseDto, user: IUser) {
    const newCourse = await this.courseModel.create({
      ...createCourseDto,
      isPublished: false,
      createBy: {
        _id: user._id,
        email: user.email,
        name: user.name,
      },
    });
    return newCourse;
  }

  async findAll() {
    const courses = await this.courseModel.find().exec();

    const result = await Promise.all(
      courses.map(async (course) => {
        const sections = await this.sectionModel
          .find({ courseId: course._id.toString() })
          .exec();

        const sectionsWithLessons = await Promise.all(
          sections.map(async (section) => {
            const lessons = await this.lessonModel
              .find({ sectionId: section._id.toString() })
              .exec();

            return {
              ...section.toObject(),
              lessons,
            };
          }),
        );

        return {
          ...course.toObject(),
          sections: sectionsWithLessons,
        };
      }),
    );

    return result;
  }

  async findOne(id: string) {
    const course = await this.courseModel.findById(id).exec();
    if (!course) {
      return null;
    }
    const sections = await this.sectionModel.find({ courseId: id }).exec();
    const sectionsWithLessons = await Promise.all(
      sections.map(async (section) => {
        const lessons = await this.lessonModel
          .find({ sectionId: section._id.toString() })
          .exec();
        return {
          ...section.toObject(),
          lessons,
        };
      }),
    );

    return {
      ...course.toObject(),
      sections: sectionsWithLessons,
    };
  }

  update(id: string, updateCourseDto: UpdateCourseDto, user: IUser) {
    return this.courseModel
      .findByIdAndUpdate(
        id,
        { ...updateCourseDto, updateBy: { _id: user._id, email: user.email } },
        { new: true },
      )
      .exec();
  }

  async updateApproval(id: string, status: string, user: IUser) {
    const validStatus = ['pending', 'approved', 'inReview'];
    if (!validStatus.includes(status)) {
      throw new BadRequestException('Trạng thái không hợp lệ');
    }

    const course = await this.courseModel.findById(id);
    if (!course) {
      throw new NotFoundException('Không tìm thấy khóa học');
    }

    // if (user.role.name === 'ADMIN' || user.role.name === 'INSTRUCTOR') {
    //   throw new ForbiddenException('Bạn không có quyền thực hiện thao tác này');
    // }

    course.status = status;

    course.approvedAt = new Date();

    await course.save();

    return {
      message: 'Cập nhật trạng thái thành công',
      data: course,
    };
  }

  async monitoring(id: string, user: IUser): Promise<ICourseMonitoring> {
    const course = await this.courseModel.findById(id).exec();
    if (!course) {
      throw new NotFoundException('Không tìm thấy khóa học');
    }

    const courseCreatorId = course.createBy?._id?.toString?.();
    if (user.role.name !== 'ADMIN' && courseCreatorId !== user._id) {
      throw new ForbiddenException(
        'Bạn không có quyền xem báo cáo khóa học này',
      );
    }

    const enrollments = await this.enrollmentModel
      .find({ courseId: id, status: 'ACTIVE' })
      .select('userId')
      .lean()
      .exec();

    const enrolledCount = enrollments.length;
    const enrolledUserIds = enrollments.map(
      (item) => new Types.ObjectId(item.userId.toString()),
    );
    console.log('enrolledUserIds', enrolledUserIds);
    console.log('rIds', id);

    const [totalLessons, progressRecords] = await Promise.all([
      this.lessonModel.countDocuments({ courseId: id }).exec(),
      this.courseProgressModel
        .find({
          courseId: id,
          userId: { $in: enrolledUserIds },
        })
        .populate({ path: 'userId', select: 'name email' })
        .lean()
        .exec(),
    ]);

    console.log('progressRecords', progressRecords);

    const completedStudents = progressRecords.filter(
      (record) => record.progressPercent === 100,
    ).length;

    const totalProgress = progressRecords.reduce(
      (sum, record) => sum + (record.progressPercent || 0),
      0,
    );

    const completionRate = enrolledCount
      ? Math.round((completedStudents / enrolledCount) * 100 * 100) / 100
      : 0;
    const averageProgress = enrolledCount
      ? Math.round((totalProgress / enrolledCount) * 100) / 100
      : 0;

    const topStudents = progressRecords
      .sort((a, b) => (b.progressPercent || 0) - (a.progressPercent || 0))
      .slice(0, 10)
      .map((record) => {
        const userRef = record.userId as any;
        return {
          userId:
            userRef?._id?.toString?.() ??
            (typeof userRef === 'string' ? userRef : ''),
          name: userRef?.name ?? '',
          email: userRef?.email,
          completedLessons: record.completedLessons || 0,
          totalLessons: record.totalLessons || totalLessons,
          progressPercent: record.progressPercent || 0,
        } as ICourseMonitoringStudent;
      });

    return {
      courseId: id,
      enrolledCount,
      completedStudents,
      completionRate,
      averageProgress,
      totalLessons,
      topStudents: topStudents.length ? topStudents : undefined,
    };
  }

  remove(id: string) {
    return this.courseModel.findByIdAndDelete(id).exec();
  }

  async getPurchaseCount(id: string) {
    const course = await this.courseModel.findById(id).exec();
    if (!course) {
      throw new NotFoundException('Không tìm thấy khóa học');
    }

    const purchaseCount = await this.enrollmentModel
      .countDocuments({
        courseId: id,
        status: 'ACTIVE',
      })
      .exec();

    return {
      courseId: id,
      courseTitle: course.title,
      purchaseCount,
    };
  }

  async getTotalStudentsPurchased() {
    const totalStudents = await this.enrollmentModel.distinct('userId').exec();

    return {
      totalStudents: totalStudents.length,
      studentsCount: totalStudents.length,
    };
  }

  async getPurchaseStats() {
    const stats = await this.enrollmentModel.aggregate([
      {
        $match: { status: 'ACTIVE' },
      },
      {
        $group: {
          _id: '$courseId',
          purchaseCount: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' },
        },
      },
      {
        $addFields: {
          uniqueUserCount: { $size: '$uniqueUsers' },
        },
      },
      {
        $lookup: {
          from: 'courses',
          localField: '_id',
          foreignField: '_id',
          as: 'courseInfo',
        },
      },
      {
        $unwind: '$courseInfo',
      },
      {
        $project: {
          courseId: '$_id',
          courseTitle: '$courseInfo.title',
          price: '$courseInfo.price',
          purchaseCount: 1,
          uniqueUserCount: 1,
          _id: 0,
        },
      },
      {
        $sort: { purchaseCount: -1 },
      },
    ]);

    return stats;
  }
}
