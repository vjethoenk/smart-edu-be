import {
  IsString,
  IsNumber,
  IsOptional,
  IsDate,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdatePromotionDto {
  @IsString()
  @IsOptional()
  code?: string;

  @IsNumber()
  @Min(0, { message: 'Discount percentage phải lớn hơn 0' })
  @Max(100, { message: 'Discount percentage không được vượt quá 100' })
  @IsOptional()
  discountPercentage?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @Type(() => Date)
  @IsDate({ message: 'Start date phải là ngày tháng năm hợp lệ' })
  @IsOptional()
  startDate?: Date;

  @Type(() => Date)
  @IsDate({ message: 'End date phải là ngày tháng năm hợp lệ' })
  @IsOptional()
  endDate?: Date;

  @IsNumber()
  @IsOptional()
  maxUsageCount?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
