import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type EnrollmentDocument = HydratedDocument<Enrollment>;

@Schema({ timestamps: true })
export class Enrollment {
  @Prop({ type: Types.ObjectId, required: true })
  userId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  courseId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  paymentId!: Types.ObjectId;

  @Prop({
    enum: ['ACTIVE', 'CANCELLED'],
    default: 'ACTIVE',
  })
  status!: string;

  @Prop({ default: null })
  enrolledAt?: Date;
}

export const EnrollmentSchema = SchemaFactory.createForClass(Enrollment);
