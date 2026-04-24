import { IsIn, IsNotEmpty } from 'class-validator';

export class ApproveQuestionDto {
  @IsNotEmpty()
  @IsIn(['pending', 'approved', 'inReview'])
  status!: string;
}
