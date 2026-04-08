import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Course } from 'src/courses/schemas/course.schema';
import { Section } from 'src/sections/schemas/section.schema';

export type QuizDocument = HydratedDocument<Quiz>;

@Schema({ timestamps: true })
export class Quiz {
  @Prop()
  title!: string;

  @Prop()
  description!: string;

  @Prop()
  limitTime!: number;

  @Prop()
  passScore!: number;

  @Prop()
  totalScore!: number;

  @Prop({ type: Object, ref: Course.name })
  courseId!: Types.ObjectId;

  @Prop({ type: Object, ref: Section.name })
  sectionId!: Types.ObjectId;

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

export const QuizSchema = SchemaFactory.createForClass(Quiz);
