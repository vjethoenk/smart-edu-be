import { IsMongoId, IsNotEmpty } from 'class-validator';

export class SubmitAttemptDto {
  @IsMongoId()
  @IsNotEmpty()
  attemptId!: string;
}
