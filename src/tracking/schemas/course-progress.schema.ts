import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CourseProgressDocument = HydratedDocument<CourseProgress>;

@Schema({ timestamps: true })
export class CourseProgress {
  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  userId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: 'Course' })
  courseId!: Types.ObjectId;

  @Prop({ default: 0 })
  totalLessons!: number;

  @Prop({ default: 0 })
  completedLessons!: number;

  @Prop({ default: 0 })
  progressPercent!: number;

  @Prop({ default: null })
  completedAt?: Date;
}

export const CourseProgressSchema =
  SchemaFactory.createForClass(CourseProgress);
CourseProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });
