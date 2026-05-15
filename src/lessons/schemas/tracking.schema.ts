import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Lesson } from 'src/lessons/schemas/lesson.schema';

export type TrackingDocument = HydratedDocument<Tracking>;

@Schema({ timestamps: true })
export class Tracking {
  @Prop()
  event!: string; // open, close, play, pause, seek, heartbeat, end, start, complete

  @Prop()
  itemType!: string; // video, quiz, pdf

  @Prop({ default: null })
  currentTime?: number; // video và pdf (đơn vị: giây)

  @Prop({ type: Types.ObjectId, ref: Lesson.name })
  lessonId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  userId?: Types.ObjectId;
}

export const TrackingSchema = SchemaFactory.createForClass(Tracking);
