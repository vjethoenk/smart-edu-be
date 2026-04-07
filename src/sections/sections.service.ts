import { Injectable } from '@nestjs/common';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Section, SectionDocument } from './schemas/section.schema';
import { Model } from 'mongoose';
import { IUser } from 'src/user/user.interface';

@Injectable()
export class SectionsService {
  constructor(
    @InjectModel(Section.name) private sectionModel: Model<SectionDocument>,
  ) {}

  async create(createSectionDto: CreateSectionDto, user: IUser) {
    return await this.sectionModel.create({
      ...createSectionDto,
      createBy: {
        _id: user._id,
        email: user.email,
      },
    });
  }

  findAll(courseId: string) {
    return this.sectionModel.find({ courseId }).sort({ createdAt: 1 }).exec();
  }

  findOne(id: string) {
    return this.sectionModel.findById(id).exec();
  }

  update(id: string, updateSectionDto: UpdateSectionDto, user: IUser) {
    return this.sectionModel
      .findByIdAndUpdate(
        id,
        { ...updateSectionDto, updateBy: { _id: user._id, email: user.email } },
        { new: true },
      )
      .exec();
  }

  remove(id: string) {
    return this.sectionModel.findByIdAndDelete(id).exec();
  }
}
