import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { Model, Types } from 'mongoose';
import { IUser } from 'src/user/user.interface';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}
  async create(createCategoryDto: CreateCategoryDto, user: IUser) {
    const category = await this.categoryModel.create({
      ...createCategoryDto,
      createBy: {
        _id: new Types.ObjectId(user._id),
        email: user.email,
      },
    });
    return category;
  }

  findAll() {
    return this.categoryModel.find().exec();
  }

  findOne(id: string) {
    return this.categoryModel.findById(id).exec();
  }

  update(id: string, updateCategoryDto: UpdateCategoryDto, user: IUser) {
    return this.categoryModel
      .findByIdAndUpdate(
        id,
        {
          ...updateCategoryDto,
          updateBy: { _id: user._id, email: user.email },
        },
        { new: true },
      )
      .exec();
  }

  remove(id: string) {
    return this.categoryModel.findByIdAndDelete(id).exec();
  }
}
