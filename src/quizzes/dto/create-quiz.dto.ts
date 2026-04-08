import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsMongoId,
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
}
