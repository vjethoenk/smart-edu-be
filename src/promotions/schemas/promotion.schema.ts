import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PromotionDocument = HydratedDocument<Promotion>;

@Schema({ timestamps: true })
export class Promotion {
  @Prop({ required: true })
  code!: string;

  @Prop({ required: true })
  discountPercentage!: number;

  @Prop({ type: Types.ObjectId, required: true, ref: 'Course' })
  courseId!: Types.ObjectId;

  @Prop({ default: null })
  description?: string;

  @Prop({ required: true })
  startDate!: Date;

  @Prop({ required: true })
  endDate!: Date;

  @Prop({ default: null })
  maxUsageCount?: number;

  @Prop({ default: 0 })
  usedCount!: number;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ type: Object })
  createdBy!: {
    _id: Types.ObjectId;
    email: string;
    name: string;
  };

  @Prop({ type: Object, default: null })
  updatedBy?: {
    _id: Types.ObjectId;
    email: string;
    name: string;
  };

  @Prop({ default: false })
  isDeleted!: boolean;

  @Prop({ default: null })
  deletedAt?: Date;
}

export const PromotionSchema = SchemaFactory.createForClass(Promotion);
PromotionSchema.index({ code: 1 });
PromotionSchema.index({ courseId: 1 });
