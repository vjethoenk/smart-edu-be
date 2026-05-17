import { IsMongoId, IsOptional, IsNumber } from 'class-validator';

export class UpdateCartDto {
  @IsMongoId({ message: 'PromotionId không hợp lệ' })
  @IsOptional()
  promotionId?: string;

  @IsNumber()
  @IsOptional()
  price?: number;
}
