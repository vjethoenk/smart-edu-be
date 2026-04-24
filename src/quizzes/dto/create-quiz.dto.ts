import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsMongoId,
  ArrayNotEmpty,
  IsArray,
  ValidateNested,
} from 'class-validator';

export class CreateQuizDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsNumber()
  limitTime!: number;

  @IsNumber()
  @Min(0)
  passScore!: number;

  @IsNumber()
  @Min(0)
  totalScore!: number;

  @IsMongoId()
  courseId!: string;

  @IsMongoId()
  sectionId!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionItemDto)
  questions!: QuestionItemDto[];
}
export class QuestionItemDto {
  @IsString()
  content!: string;

  @IsArray()
  options!: string[];

  @IsString()
  correctAnswer!: string;
}
