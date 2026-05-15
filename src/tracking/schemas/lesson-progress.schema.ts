import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { TrackingItemType } from '../enums/item-type.enum';

export type LessonProgressDocument = HydratedDocument<LessonProgress>;

@Schema({ timestamps: true })
export class LessonProgress {
  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  userId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: 'Lesson' })
  lessonId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: 'Course' })
  courseId!: Types.ObjectId;

  @Prop({ enum: Object.values(TrackingItemType), required: true })
  itemType!: TrackingItemType;

  @Prop({ default: 0 })
  progressPercent!: number;

  @Prop({ default: 0 })
  watchedSeconds!: number;

  @Prop({ default: 0 })
  totalDuration!: number;

  @Prop({ default: 0 })
  lastPosition!: number;

  @Prop({ type: [{ start: Number, end: Number }], default: [] })
  watchedRanges!: { start: number; end: number }[];

  @Prop({ default: false })
  isCompleted!: boolean;

  @Prop({ default: null })
  completedAt?: Date;

  @Prop({ default: null })
  startedAt?: Date;
}

export const LessonProgressSchema =
  SchemaFactory.createForClass(LessonProgress);
LessonProgressSchema.index(
  { userId: 1, lessonId: 1, itemType: 1 },
  { unique: true },
);
LessonProgressSchema.index({ userId: 1, courseId: 1 });
