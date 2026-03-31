import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';

export type RoleDocument = HydratedDocument<Role>;

@Schema({ timestamps: true })
export class Role {
  @Prop()
  name!: string;

  @Prop()
  description!: string;

  @Prop()
  isActive!: boolean;

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

  @Prop()
  createAt!: Date;

  @Prop()
  updateAt!: Date;

  @Prop()
  isDeleted!: boolean;

  @Prop()
  deletedAt!: Date;
}

export const RoleSchema = SchemaFactory.createForClass(Role);
