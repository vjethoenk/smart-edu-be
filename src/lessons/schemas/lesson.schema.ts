import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Course } from 'src/courses/schemas/course.schema';
import { Section } from 'src/sections/schemas/section.schema';

export type LessonDocument = HydratedDocument<Lesson>;

@Schema({ timestamps: true })
export class Lesson {
  @Prop()
  title!: string;

  @Prop()
  content!: string;

  @Prop()
  type!: string;

  @Prop()
  videoUrl!: string;

  @Prop({ type: Object, ref: Section.name })
  sectionId!: Types.ObjectId;

  @Prop({ type: Object, ref: Course.name })
  courseId!: Types.ObjectId;

  @Prop()
  createdAt!: Date;

  @Prop()
  updateAt!: Date;

  @Prop()
  quizId!: string;

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

export const LessonSchema = SchemaFactory.createForClass(Lesson);
