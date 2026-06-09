import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from 'src/user/schemas/user.schema';
import { Role, RoleDocument } from 'src/role/schemas/role.schema';
import { Course, CourseDocument } from 'src/courses/schemas/course.schema';
import { Payment, PaymentDocument } from 'src/payments/schemas/payment.schema';
import {
  Enrollment,
  EnrollmentDocument,
} from 'src/enrollments/schemas/enrollment.schema';
import { Lesson, LessonDocument } from 'src/lessons/schemas/lesson.schema';
import {
  CourseProgress,
  CourseProgressDocument,
} from 'src/tracking/schemas/course-progress.schema';
import {
  LessonProgress,
  LessonProgressDocument,
} from 'src/tracking/schemas/lesson-progress.schema';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(Enrollment.name)
    private enrollmentModel: Model<EnrollmentDocument>,
    @InjectModel(Lesson.name) private lessonModel: Model<LessonDocument>,
    @InjectModel(CourseProgress.name)
    private courseProgressModel: Model<CourseProgressDocument>,
    @InjectModel(LessonProgress.name)
    private lessonProgressModel: Model<LessonProgressDocument>,
  ) {}

  async getOverview() {
    const totalUsers = await this.userModel.countDocuments({
      isDeleted: { $ne: true },
    });

    const instructorsAgg = await this.userModel.aggregate([
      {
        $lookup: {
          from: 'roles',
          localField: 'role',
          foreignField: '_id',
          as: 'roleDoc',
        },
      },
      { $unwind: { path: '$roleDoc', preserveNullAndEmptyArrays: true } },
      { $match: { 'roleDoc.name': { $regex: /(teacher|instructor)/i } } },
      { $count: 'count' },
    ]);
    const totalInstructors = instructorsAgg[0]?.count || 0;

    const totalCourses = await this.courseModel.countDocuments({
      isDeleted: { $ne: true },
    });
    const totalOrders = await this.paymentModel.countDocuments();
    const totalRevenueAgg = await this.paymentModel.aggregate([
      { $match: { status: 'SUCCESS' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalRevenue = totalRevenueAgg[0]?.total || 0;

    const totalEnrollments = await this.enrollmentModel.countDocuments();
    const totalLessons = await this.lessonModel.countDocuments();

    return {
      totalUsers,
      totalInstructors,
      totalCourses,
      totalOrders,
      totalRevenue,
      totalEnrollments,
      totalLessons,
    };
  }

  private parseRange(start?: string, end?: string) {
    const match: any = {};
    if (start || end) match.createdAt = {};
    if (start) match.createdAt.$gte = new Date(start);
    if (end) match.createdAt.$lte = new Date(end);
    return match;
  }

  async getRevenueStatistics(period: string, start?: string, end?: string) {
    const match: any = { status: 'SUCCESS' };
    Object.assign(match, this.parseRange(start, end));

    let groupId: any;
    switch (period) {
      case 'day':
        groupId = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
        break;
      case 'month':
        groupId = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
        break;
      case 'year':
        groupId = { $dateToString: { format: '%Y', date: '$createdAt' } };
        break;
      case 'week':
        groupId = {
          year: { $isoWeekYear: '$createdAt' },
          week: { $isoWeek: '$createdAt' },
        };
        break;
      default:
        groupId = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
    }

    const pipeline: any[] = [{ $match: match }];
    pipeline.push({
      $group: {
        _id: groupId,
        revenue: { $sum: '$amount' },
        orders: { $sum: 1 },
      },
    });
    pipeline.push({ $sort: { _id: 1 } });

    const result = await (this.paymentModel as any).aggregate(pipeline);

    // normalize week id shape
    const normalized = result.map((r) => {
      let label = r._id;
      if (typeof label === 'object') label = `${label.year}-W${label.week}`;
      return { period: label, revenue: r.revenue, orders: r.orders };
    });
    return normalized;
  }

  async getMonthlyRevenueChart(year: number) {
    const start = new Date(year, 0, 1);
    const end = new Date(year + 1, 0, 1);
    const pipeline = [
      { $match: { status: 'SUCCESS', createdAt: { $gte: start, $lt: end } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          revenue: { $sum: '$amount' },
        },
      },
      { $sort: { _id: 1 } },
    ];
    const result = await (this.paymentModel as any).aggregate(pipeline);
    // ensure all months exist
    const map = new Map<string, number>(
      result.map((r: any) => [String(r._id), Number(r.revenue)]),
    );
    const months: { month: string; revenue: number }[] = [];
    for (let m = 0; m < 12; m++) {
      const key = `${year}-${(m + 1).toString().padStart(2, '0')}`;
      months.push({ month: key, revenue: map.get(key) || 0 });
    }
    return months;
  }

  async getTopCourses(type: string, limit = 10) {
    if (type === 'revenue') {
      const pipeline = [
        { $match: { status: 'SUCCESS' } },
        {
          $group: {
            _id: '$courseId',
            revenue: { $sum: '$amount' },
            sales: { $sum: 1 },
          },
        },
        {
          $addFields: {
            courseObjectId: {
              $toObjectId: '$_id',
            },
          },
        },
        {
          $lookup: {
            from: 'courses',
            localField: 'courseObjectId',
            foreignField: '_id',
            as: 'course',
          },
        },
        { $unwind: { path: '$course', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            courseId: '$_id',
            title: '$course.title',
            revenue: 1,
            sales: 1,
          },
        },
      ];
      return (this.paymentModel as any).aggregate(pipeline);
    }

    if (type === 'sales' || type === 'students') {
      const pipeline = [
        {
          $group: {
            _id: '$courseId',
            students: { $sum: 1 },
          },
        },
        {
          $addFields: {
            courseObjectId: {
              $toObjectId: '$_id',
            },
          },
        },
        { $sort: { students: -1 } },
        { $limit: limit },
        {
          $lookup: {
            from: 'courses',
            localField: 'courseObjectId',
            foreignField: '_id',
            as: 'course',
          },
        },
        {
          $unwind: {
            path: '$course',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            courseId: '$_id',
            title: '$course.title',
            students: 1,
          },
        },
      ];

      return (this.paymentModel as any).aggregate(pipeline);
    }

    // rating not available in current schema
    return [];
  }

  async getCourseCompletionRates(limit = 20) {
    const pipeline = [
      {
        $group: {
          _id: '$courseId',
          avgProgress: { $avg: '$progressPercent' },
          completedCount: {
            $sum: { $cond: [{ $gt: ['$completedAt', null] }, 1, 0] },
          },
          users: { $sum: 1 },
        },
      },
      { $sort: { avgProgress: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'courses',
          localField: '_id',
          foreignField: '_id',
          as: 'course',
        },
      },
      { $unwind: { path: '$course', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          courseId: '$_id',
          title: '$course.title',
          avgProgress: 1,
          completedCount: 1,
          users: 1,
        },
      },
    ];
    return (this.courseProgressModel as any).aggregate(pipeline);
  }

  async getNewStudents(start?: string, end?: string) {
    const match: any = { isDeleted: { $ne: true } };
    if (start || end) match.createdAt = {};
    if (start) match.createdAt.$gte = new Date(start);
    if (end) match.createdAt.$lte = new Date(end);
    const pipeline = [
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ];
    return (this.userModel as any).aggregate(pipeline);
  }

  async getActiveStudents(start?: string, end?: string) {
    const match: any = {};
    if (start || end) match.updatedAt = {};
    if (start) match.updatedAt.$gte = new Date(start);
    if (end) match.updatedAt.$lte = new Date(end);
    // consider activity tracked in lesson progress
    const pipeline = [
      { $match: {} },
      { $group: { _id: '$userId', lastActivity: { $max: '$updatedAt' } } },
      { $match: start || end ? { lastActivity: match.updatedAt } : {} },
      { $count: 'activeUsers' },
    ];
    const res = await (this.lessonProgressModel as any).aggregate(pipeline);
    return { activeUsers: res[0]?.activeUsers || 0 };
  }

  async getStudentsProgressOverview() {
    const avg = await this.courseProgressModel.aggregate([
      {
        $group: {
          _id: null,
          avgProgress: { $avg: '$progressPercent' },
          completedCount: {
            $sum: { $cond: [{ $gt: ['$completedAt', null] }, 1, 0] },
          },
        },
      },
    ]);
    return {
      avgProgress: avg[0]?.avgProgress || 0,
      completedCourses: avg[0]?.completedCount || 0,
    };
  }

  async getOrderSummary() {
    const total = await this.paymentModel.countDocuments();
    const byStatus = await (this.paymentModel as any).aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          revenue: { $sum: '$amount' },
        },
      },
    ]);
    return { totalOrders: total, byStatus };
  }

  async getRevenueByPaymentMethod() {
    // payment schema does not explicitly store `method` — grouping by `orderInfo` or `currency` as fallback
    const byOrderInfo = await (this.paymentModel as any).aggregate([
      { $match: { status: 'SUCCESS' } },
      {
        $group: {
          _id: '$orderInfo',
          revenue: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { revenue: -1 } },
    ]);
    const byCurrency = await (this.paymentModel as any).aggregate([
      { $match: { status: 'SUCCESS' } },
      {
        $group: {
          _id: '$currency',
          revenue: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);
    return { byOrderInfo, byCurrency };
  }

  async getVideoOverview() {
    const totalVideos = await this.lessonModel.countDocuments({
      isDeleted: { $ne: true },
      videoUrl: { $exists: true, $ne: '' },
    });
    const totalDurationAgg = await (this.lessonModel as any).aggregate([
      { $match: { isDeleted: { $ne: true } } },
      {
        $group: {
          _id: null,
          totalDuration: {
            $sum: { $ifNull: ['$completionConditions.duration', 0] },
          },
        },
      },
    ]);
    const totalDuration = totalDurationAgg[0]?.totalDuration || 0;
    return { totalVideos, totalDuration };
  }

  async getTopWatchedVideos(limit = 10) {
    const pipeline = [
      {
        $group: {
          _id: '$lessonId',
          watchedSeconds: { $sum: '$watchedSeconds' },
          views: { $sum: 1 },
        },
      },
      { $sort: { watchedSeconds: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'lessons',
          localField: '_id',
          foreignField: '_id',
          as: 'lesson',
        },
      },
      { $unwind: { path: '$lesson', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          lessonId: '$_id',
          title: '$lesson.title',
          watchedSeconds: 1,
          views: 1,
        },
      },
    ];
    return (this.lessonProgressModel as any).aggregate(pipeline);
  }

  async getVideoCompletionRate() {
    const total = await this.lessonProgressModel.countDocuments();
    const completed = await this.lessonProgressModel.countDocuments({
      isCompleted: true,
    });
    return {
      total,
      completed,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
    };
  }
}
