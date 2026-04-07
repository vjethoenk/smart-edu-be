import { Injectable } from '@nestjs/common';
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
      },
    });
    return newCourse;
  }

  findAll() {
    return this.courseModel.find().exec();
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

  remove(id: string) {
    return this.courseModel.findByIdAndDelete(id).exec();
  }
}
