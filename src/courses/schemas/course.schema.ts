import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { Category } from 'src/categories/schemas/category.schema';
import { User } from 'src/user/schemas/user.schema';

export type CourseDocument = HydratedDocument<Course>;

@Schema({ timestamps: true })
export class Course {
  @Prop()
  title!: string;

  @Prop()
  description!: string;

  @Prop()
  thumbnail!: string;

  @Prop()
  price!: string;

  @Prop()
  level!: string;

  @Prop({ type: Object, ref: Category.name })
  categoryId!: Types.ObjectId;

  @Prop()
  isPublished!: boolean;

  @Prop()
  createdAt!: Date;

  @Prop()
  updateAt!: Date;

  @Prop({ default: false })
  isDeleted!: boolean;

  @Prop({ default: null })
  deletedAt?: Date;

  @Prop({ type: Object })
  createBy!: {
    _id: Types.ObjectId;
    email: string;
  };

  @Prop({ type: Object })
  updateBy!: {
    _id: Types.ObjectId;
    email: string;
  };

  @Prop({ type: Object })
  deleteBy!: {
    _id: Types.ObjectId;
    email: string;
  };
}

export const CourseSchema = SchemaFactory.createForClass(Course);
