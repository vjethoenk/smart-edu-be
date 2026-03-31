import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
} from 'class-validator';
import mongoose from 'mongoose';

export class CreateRoleDto {
  @IsNotEmpty({ message: 'Name không được bỏ trống' })
  name!: string;

  @IsNotEmpty({ message: 'Description không được bỏ trống' })
  description!: string;

  @IsNotEmpty({ message: 'isActive không được bỏ trống' })
  @IsBoolean({ message: 'isActive có kiểu là boolean' })
  isActive!: boolean;
}
