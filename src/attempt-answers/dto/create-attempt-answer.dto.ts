import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class CreateAttemptAnswerDto {
  @IsMongoId()
  @IsNotEmpty()
  attemptId!: string;

  @IsMongoId()
  @IsNotEmpty()
  questionId!: string;

  @IsString()
  @IsNotEmpty()
  selectedAnswer!: string;
}
