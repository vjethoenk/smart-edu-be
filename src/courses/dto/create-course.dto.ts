import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsMongoId,
  IsNumberString,
} from 'class-validator';

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty({ message: 'Title không được để trống' })
  title!: string;

  @IsString()
  @IsNotEmpty({ message: 'Description không được để trống' })
  description!: string;

  @IsString()
  @IsNotEmpty({ message: 'Thumbnail không được để trống' })
  thumbnail!: string;

  @IsString()
  @IsNotEmpty({ message: 'Price không được để trống' })
  price!: string;

  @IsString()
  @IsNotEmpty({ message: 'Level không được để trống' })
  level!: string;

  @IsMongoId({ message: 'CategoryId không hợp lệ' })
  categoryId!: string;

  @IsOptional()
  @IsBoolean({ message: 'isPublished phải là boolean' })
  isPublished?: boolean;

  @IsString()
  status!: string;
}
