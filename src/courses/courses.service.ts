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
import { Model } from 'mongoose';

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectModel(Section.name) private sectionModel: Model<SectionDocument>,
    @InjectModel(Lesson.name) private lessonModel: Model<LessonDocument>,
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

    if (user.role.name !== 'ADMIN') {
      throw new ForbiddenException('Bạn không có quyền thực hiện thao tác này');
    }

    course.status = status;

    course.approvedAt = new Date();

    await course.save();

    return {
      message: 'Cập nhật trạng thái thành công',
      data: course,
    };
  }

  remove(id: string) {
    return this.courseModel.findByIdAndDelete(id).exec();
  }
}
