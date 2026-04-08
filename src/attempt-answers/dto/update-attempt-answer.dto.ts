import { PartialType } from '@nestjs/mapped-types';
import { CreateAttemptAnswerDto } from './create-attempt-answer.dto';

export class UpdateAttemptAnswerDto extends PartialType(CreateAttemptAnswerDto) {}
