import { IsArray, IsMongoId, IsNotEmpty, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

export class SubmitAnswersDto {
  @IsArray()
  @ArrayMinSize(1)
  @Type(() => AnswerItem)
  answers!: AnswerItem[];
}

class AnswerItem {
  @IsMongoId()
  @IsNotEmpty()
  questionId!: string;

  @IsNotEmpty()
  selectedAnswer!: string;
}
