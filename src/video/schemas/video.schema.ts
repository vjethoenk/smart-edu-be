import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type VideoDocument = HydratedDocument<Video>;

@Schema({ timestamps: true })
export class Video {
  @Prop()
  title!: string;

  @Prop()
  originalUrl!: string;

  @Prop()
  hlsUrl!: string;

  @Prop()
  createdAt!: Date;

  @Prop()
  updateAt!: Date;

  @Prop({ default: false })
  isDeleted!: boolean;

  @Prop({ default: null })
  deletedAt?: Date;
}

export const VideoSchema = SchemaFactory.createForClass(Video);
