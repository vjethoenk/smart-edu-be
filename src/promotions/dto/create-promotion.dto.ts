import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsMongoId,
  IsOptional,
  IsDate,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePromotionDto {
  @IsString()
  @IsNotEmpty({ message: 'Code không được để trống' })
  code!: string;

  @IsNumber()
  @Min(0, { message: 'Discount percentage phải lớn hơn 0' })
  @Max(100, { message: 'Discount percentage không được vượt quá 100' })
  @IsNotEmpty({ message: 'Discount percentage không được để trống' })
  discountPercentage!: number;

  @IsMongoId({ message: 'CourseId không hợp lệ' })
  @IsNotEmpty({ message: 'CourseId không được để trống' })
  courseId!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @Type(() => Date)
  @IsDate({ message: 'Start date phải là ngày tháng năm hợp lệ' })
  @IsNotEmpty({ message: 'Start date không được để trống' })
  startDate!: Date;

  @Type(() => Date)
  @IsDate({ message: 'End date phải là ngày tháng năm hợp lệ' })
  @IsNotEmpty({ message: 'End date không được để trống' })
  endDate!: Date;

  @IsNumber()
  @IsOptional()
  maxUsageCount?: number;
}
