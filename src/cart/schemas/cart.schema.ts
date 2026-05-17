import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CartDocument = HydratedDocument<Cart>;

@Schema({ timestamps: true })
export class Cart {
  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  userId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: 'Course' })
  courseId!: Types.ObjectId;

  @Prop({ required: true })
  price!: number;

  @Prop({ default: 0 })
  discount!: number;

  @Prop({ default: 0 })
  discountAmount!: number;

  @Prop()
  totalPrice!: number;

  @Prop({ type: Object, ref: 'Promotion', default: null })
  promotionId?: Types.ObjectId;

  @Prop({ default: new Date() })
  addedAt!: Date;
}

export const CartSchema = SchemaFactory.createForClass(Cart);
CartSchema.index({ userId: 1 });
CartSchema.index({ userId: 1, courseId: 1 }, { unique: true });
