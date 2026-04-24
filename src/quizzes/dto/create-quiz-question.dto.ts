import {
  IsNotEmpty,
  IsMongoId,
  IsString,
  IsArray,
  ArrayMinSize,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateQuizQuestionDto {
  @IsMongoId()
  @IsNotEmpty()
  quizId!: string;

  @IsMongoId()
  @IsNotEmpty()
  questionId!: string;

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

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  score!: number;
}
