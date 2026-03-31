import { IsEmail, IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Name không được bỏ trống' })
  name!: string;

  @IsEmail()
  @IsNotEmpty({ message: 'Email không được bỏ trống' })
  email!: string;

  @IsNotEmpty({ message: 'Password không được bỏ trống' })
  password!: string;

  @IsNotEmpty({ message: 'Role không được để trống' })
  role!: Types.ObjectId;
}
export class RegisterUserDto {
  @IsNotEmpty({ message: 'Name không được bỏ trống' })
  name!: string;

  @IsEmail({}, { message: 'Sai định dạng email' })
  @IsNotEmpty({ message: 'Email không được bỏ trống' })
  email!: string;

  @IsNotEmpty({ message: 'Phone không được bỏ trống' })
  phone!: string;

  @IsNotEmpty({ message: 'Password không được bỏ trống' })
  password!: string;

  role?: Types.ObjectId;
}
