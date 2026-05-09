import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { Enrollment, EnrollmentDocument } from './schemas/enrollment.schema';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectModel(Enrollment.name)
    private enrollmentModel: Model<EnrollmentDocument>,
  ) {}

  async create(createEnrollmentDto: CreateEnrollmentDto) {
    const enrollment = new this.enrollmentModel(createEnrollmentDto);
    return enrollment.save();
  }

  async findAll() {
    return this.enrollmentModel.find().exec();
  }

  async findOne(id: string) {
    return this.enrollmentModel.findById(id).exec();
  }

  async findByUserId(userId: string) {
    return this.enrollmentModel.find({ userId }).populate('courseId').exec();
  }

  async update(id: string, updateEnrollmentDto: UpdateEnrollmentDto) {
    return this.enrollmentModel
      .findByIdAndUpdate(id, updateEnrollmentDto, { new: true })
      .exec();
  }

  async remove(id: string) {
    return this.enrollmentModel.findByIdAndDelete(id).exec();
  }
}
