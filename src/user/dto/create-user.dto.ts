import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Name không được bỏ trống' })
  name!: string;

  @IsEmail()
  @IsNotEmpty({ message: 'Email không được bỏ trống' })
  email!: string;

  @IsNotEmpty({ message: 'Password không được bỏ trống' })
  password!: string;
}
