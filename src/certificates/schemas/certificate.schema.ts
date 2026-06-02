import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';

export type CertificateDocument = HydratedDocument<Certificate>;

@Schema({ timestamps: true })
export class Certificate {
  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' })
  userId!: Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Course' })
  courseId!: Types.ObjectId;

  @Prop({ required: true, unique: true })
  certificateCode!: string;

  @Prop({ required: true, default: Date.now })
  issuedAt!: Date;
}

export const CertificateSchema = SchemaFactory.createForClass(Certificate);
CertificateSchema.index({ userId: 1, courseId: 1 }, { unique: true });
