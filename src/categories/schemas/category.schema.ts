import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';

export type CategoryDocument = HydratedDocument<Category>;

@Schema({ timestamps: true })
export class Category {
  @Prop()
  name!: string;

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

export const CategorySchema = SchemaFactory.createForClass(Category);
