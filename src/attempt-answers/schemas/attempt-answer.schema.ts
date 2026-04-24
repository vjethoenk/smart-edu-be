import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type AttemptAnswerDocument = HydratedDocument<AttemptAnswer>;

@Schema({ timestamps: true })
export class AttemptAnswer {
  @Prop({ type: Types.ObjectId, required: true })
  attemptId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  questionId!: Types.ObjectId;

  @Prop({ required: true })
  selectedAnswer!: string;

  @Prop({ default: false })
  isCorrect!: boolean;

  @Prop({ default: 0 })
  score!: number;
}

export const AttemptAnswerSchema = SchemaFactory.createForClass(AttemptAnswer);
