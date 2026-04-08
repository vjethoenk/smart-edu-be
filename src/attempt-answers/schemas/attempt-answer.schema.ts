import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type AttemptAnswerDocument = HydratedDocument<AttemptAnswer>;

@Schema({ timestamps: true })
export class AttemptAnswer {
  @Prop()
  attemptId!: string;

  @Prop()
  questionId!: string;

  @Prop()
  selectedAnswer!: string;

  @Prop({ default: false })
  isCorrect!: boolean;

  @Prop()
  score!: number;
}

export const AttemptAnswerSchema = SchemaFactory.createForClass(AttemptAnswer);
