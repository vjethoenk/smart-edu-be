import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { Promotion, PromotionDocument } from './schemas/promotion.schema';
import { Course, CourseDocument } from 'src/courses/schemas/course.schema';
import { IUser } from 'src/user/user.interface';

@Injectable()
export class PromotionsService {
  constructor(
    @InjectModel(Promotion.name)
    private promotionModel: Model<PromotionDocument>,
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
  ) {}

  async create(createPromotionDto: CreatePromotionDto, user: IUser) {
    const { code, courseId, startDate, endDate } = createPromotionDto;

    // Check if course exists
    const course = await this.courseModel.findById(courseId);
    if (!course) {
      throw new NotFoundException('Khóa học không tồn tại');
    }

    // Check if promotion code already exists
    const existingPromotion = await this.promotionModel.findOne({ code });
    if (existingPromotion) {
      throw new BadRequestException('Mã khuyến mãi này đã tồn tại');
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      throw new BadRequestException('Ngày kết thúc phải sau ngày bắt đầu');
    }

    const promotion = new this.promotionModel({
      ...createPromotionDto,
      courseId: new Types.ObjectId(courseId),
      createdBy: {
        _id: user._id,
        email: user.email,
        name: user.name,
      },
    });

    return promotion.save();
  }

  async findAll() {
    return this.promotionModel
      .find({ isDeleted: false, isActive: true })
      .populate('courseId', 'title price')
      .sort({ startDate: -1 })
      .exec();
  }

  async findOne(id: string) {
    const promotion = await this.promotionModel
      .findOne({ _id: id, isDeleted: false })
      .populate('courseId')
      .exec();

    if (!promotion) {
      throw new NotFoundException('Khuyến mãi không tồn tại');
    }

    return promotion;
  }

  async findByCourse(courseId: string) {
    return this.promotionModel
      .find({
        courseId: new Types.ObjectId(courseId),
        isDeleted: false,
        isActive: true,
        endDate: { $gte: new Date() },
      })
      .sort({ discountPercentage: -1 })
      .exec();
  }

  async findByCode(code: string) {
    const promotion = await this.promotionModel.findOne({
      code,
      isDeleted: false,
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
    });

    if (!promotion) {
      throw new NotFoundException('Mã khuyến mãi không hợp lệ hoặc đã hết hạn');
    }

    // Check usage limit
    if (
      promotion.maxUsageCount &&
      promotion.usedCount >= promotion.maxUsageCount
    ) {
      throw new BadRequestException('Mã khuyến mãi này đã hết lượt sử dụng');
    }

    return promotion;
  }

  async update(
    id: string,
    updatePromotionDto: UpdatePromotionDto,
    user: IUser,
  ) {
    const promotion = await this.findOne(id);

    // Validate dates if provided
    if (updatePromotionDto.startDate || updatePromotionDto.endDate) {
      const start = updatePromotionDto.startDate || promotion.startDate;
      const end = updatePromotionDto.endDate || promotion.endDate;

      if (start >= end) {
        throw new BadRequestException('Ngày kết thúc phải sau ngày bắt đầu');
      }
    }

    // Check if code is duplicated
    if (updatePromotionDto.code && updatePromotionDto.code !== promotion.code) {
      const existing = await this.promotionModel.findOne({
        code: updatePromotionDto.code,
        _id: { $ne: id },
      });
      if (existing) {
        throw new BadRequestException('Mã khuyến mãi này đã tồn tại');
      }
    }

    return this.promotionModel.findByIdAndUpdate(
      id,
      {
        ...updatePromotionDto,
        updatedBy: {
          _id: user._id,
          email: user.email,
          name: user.name,
        },
      },
      { new: true },
    );
  }

  async remove(id: string, user: IUser) {
    const promotion = await this.findOne(id);

    return this.promotionModel.findByIdAndUpdate(
      id,
      {
        isDeleted: true,
        deletedAt: new Date(),
        updatedBy: {
          _id: user._id,
          email: user.email,
          name: user.name,
        },
      },
      { new: true },
    );
  }

  async incrementUsageCount(promotionId: string) {
    return this.promotionModel.findByIdAndUpdate(
      promotionId,
      { $inc: { usedCount: 1 } },
      { new: true },
    );
  }

  async validatePromotion(promotionId: string, courseId: string) {
    const promotion = await this.promotionModel.findOne({
      _id: promotionId,
      courseId: new Types.ObjectId(courseId),
      isDeleted: false,
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
    });

    if (!promotion) {
      throw new BadRequestException('Khuyến mãi không hợp lệ cho khóa học này');
    }

    return promotion;
  }
}
