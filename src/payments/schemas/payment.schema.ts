import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PaymentDocument = HydratedDocument<Payment>;

@Schema({ timestamps: true })
export class Payment {
  @Prop({ type: Object, required: true })
  user!: {
    _id: Types.ObjectId;
    email: string;
    name: string;
  };

  @Prop({ type: Types.ObjectId, required: true })
  courseId!: Types.ObjectId;

  @Prop({ required: true })
  amount!: number;

  @Prop({ default: 'VND' })
  currency!: string;

  @Prop({
    enum: ['PENDING', 'SUCCESS', 'FAILED', 'CANCELLED'],
    default: 'PENDING',
  })
  status!: string;

  @Prop({ required: true })
  orderCode!: number;

  @Prop({ required: true })
  checkoutUrl!: string;

  @Prop({ default: null })
  transactionId?: string;

  @Prop({ default: null })
  orderInfo?: string;

  @Prop({ default: null })
  confirmedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'Promotion', default: null })
  promotionId?: Types.ObjectId;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
