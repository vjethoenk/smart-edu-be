import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  ValidateNested,
  IsObject,
  Min,
} from 'class-validator';

export class CompletionConditionsDto {
  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  duration?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minWatchPercent?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  requiredReadingTime?: number;
}

export class CreateLessonDto {
  @IsNotEmpty({ message: 'Title không được để trống' })
  title!: string;

  @IsNotEmpty({ message: 'Type không được để trống' })
  type!: string;

  @IsNotEmpty({ message: 'Content không được để trống' })
  content!: string;

  @IsOptional()
  @IsString()
  videoUrl?: string;

  @IsNotEmpty({ message: 'Section ID không được để trống' })
  sectionId!: string;

  @IsNotEmpty({ message: 'Course ID không được để trống' })
  courseId!: string;

  @IsOptional()
  @IsString()
  quizId?: string;

  @IsOptional()
  @IsString()
  pdfUrl?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CompletionConditionsDto)
  completionConditions?: CompletionConditionsDto;
}
