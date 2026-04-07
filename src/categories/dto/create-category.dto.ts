import { IsEmpty, IsNotEmpty } from 'class-validator';

export class CreateCategoryDto {
  @IsNotEmpty({ message: 'Name không được bỏ trống' })
  name!: string;

  @IsNotEmpty({ message: 'Description không được bỏ trống' })
  description!: string;
}
