import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { Role } from 'src/role/schemas/role.schema';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop()
  name!: string;

  @Prop({ required: true })
  email!: string;

  @Prop({ required: true })
  password!: string;

  @Prop()
  age!: number;

  @Prop()
  phone!: string;

  @Prop()
  address!: string;

  @Prop({ type: Object, ref: Role.name })
  role!: Types.ObjectId;

  @Prop()
  refreshToken!: string;

  @Prop()
  createdAt!: Date;

  @Prop()
  updateAt!: Date;

  @Prop({ default: false })
  isDeleted!: boolean;

  @Prop({ default: null })
  deletedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
