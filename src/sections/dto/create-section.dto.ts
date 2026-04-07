import { IsMongoId, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateSectionDto {
  @IsString()
  @IsNotEmpty({ message: 'Title không được để trống' })
  title!: string;

  // @IsNumber()
  // @IsNotEmpty({ message: 'Order không được để trống' })
  // order!: number;

  @IsMongoId({ message: 'CourseId không hợp lệ' })
  courseId!: string;
}
