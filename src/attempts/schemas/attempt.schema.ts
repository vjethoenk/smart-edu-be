import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type AttemptDocument = HydratedDocument<Attempt>;

@Schema({ timestamps: true })
export class Attempt {
  @Prop({ type: Types.ObjectId, required: true })
  userId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  quizId!: Types.ObjectId;

  @Prop({ default: () => new Date() })
  startTime!: Date;

  @Prop({ required: false })
  endTime?: Date;

  @Prop({ default: 0 })
  score!: number;

  @Prop({ enum: ['in_progress', 'submitted'], default: 'in_progress' })
  status!: string;
}

export const AttemptSchema = SchemaFactory.createForClass(Attempt);
