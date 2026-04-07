import { Injectable } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { IUser } from 'src/user/user.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Course, CourseDocument } from './schemas/course.schema';
import { Model } from 'mongoose';

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
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

  findOne(id: string) {
    return this.courseModel.findById(id).exec();
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
