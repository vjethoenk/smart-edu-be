import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type QuestionDocument = HydratedDocument<Question>;

@Schema({ timestamps: true })
export class Question {
  @Prop()
  content!: string;

  @Prop()
  options!: string[];

  @Prop({ required: true })
  correctAnswer!: string;

  @Prop({ enum: ['pending', 'approved', 'inReview'], default: 'pending' })
  status!: string;

  @Prop({ default: 1 })
  score!: number;

  @Prop()
  createdAt!: Date;

  @Prop()
  updateAt!: Date;

  @Prop()
  approvedAt!: Date;

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

export const QuestionSchema = SchemaFactory.createForClass(Question);
