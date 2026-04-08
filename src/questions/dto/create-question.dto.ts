import {
  IsString,
  IsNotEmpty,
  IsArray,
  ArrayMinSize,
  IsIn,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateQuizQuestionDto {
  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsArray()
  @ArrayMinSize(2)
  @IsString({ each: true })
  options!: string[];

  @IsString()
  @IsNotEmpty()
  correctAnswer!: string;

  @IsIn(['pending', 'approved'])
  status!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  score!: number;
}
