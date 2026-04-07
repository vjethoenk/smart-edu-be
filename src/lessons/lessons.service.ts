import { Injectable } from '@nestjs/common';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Lesson, LessonDocument } from './schemas/lesson.schema';
import { Model } from 'mongoose';
import { IUser } from 'src/user/user.interface';

@Injectable()
export class LessonsService {
  constructor(
    @InjectModel(Lesson.name) private lessonModel: Model<LessonDocument>,
  ) {}
  async create(createLessonDto: CreateLessonDto, user: IUser) {
    return await this.lessonModel.create({
      ...createLessonDto,
      createBy: {
        _id: user._id,
        email: user.email,
      },
    });
  }

  findAll(id: string) {
    return this.lessonModel.find({ sectionId: id }).exec();
  }

  findOne(id: string) {
    return this.lessonModel.findById(id).exec();
  }

  update(id: string, updateLessonDto: UpdateLessonDto, user: IUser) {
    return this.lessonModel
      .findByIdAndUpdate(
        id,
        { ...updateLessonDto, updateBy: { _id: user._id, email: user.email } },
        { new: true },
      )
      .exec();
  }

  remove(id: string) {
    return this.lessonModel.findByIdAndDelete(id).exec();
  }
}
