import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type QuizQuestionDocument = HydratedDocument<QuizQuestion>;

@Schema({ timestamps: true })
export class QuizQuestion {
  @Prop({ type: Types.ObjectId, required: true })
  quizId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  questionId?: Types.ObjectId;

  @Prop({ required: true })
  content!: string;

  @Prop([String])
  options!: string[];

  @Prop({ required: true })
  correctAnswer!: string;

  @Prop({ default: 1 })
  score!: number;

  @Prop()
  createdAt!: Date;

  @Prop()
  updateAt!: Date;

  @Prop({ default: false })
  isDeleted!: boolean;

  @Prop({ default: null })
  deletedAt?: Date;

  @Prop({ type: Object })
  createBy!: {
    _id: Types.ObjectId;
    email: string;
  };

  @Prop({ type: Object })
  updateBy!: {
    _id: Types.ObjectId;
    email: string;
  };

  @Prop({ type: Object })
  deleteBy!: {
    _id: Types.ObjectId;
    email: string;
  };
}

export const QuizQuestionSchema = SchemaFactory.createForClass(QuizQuestion);
