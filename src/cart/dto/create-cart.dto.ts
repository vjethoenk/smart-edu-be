import { IsMongoId, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateCartDto {
  @IsMongoId({ message: 'CourseId không hợp lệ' })
  @IsNotEmpty({ message: 'CourseId không được để trống' })
  courseId!: string;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsMongoId({ message: 'PromotionId không hợp lệ' })
  @IsOptional()
  promotionId?: string;
}
