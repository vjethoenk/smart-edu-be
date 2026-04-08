import { Module } from '@nestjs/common';
import { AttemptAnswersService } from './attempt-answers.service';
import { AttemptAnswersController } from './attempt-answers.controller';

@Module({
  controllers: [AttemptAnswersController],
  providers: [AttemptAnswersService],
})
export class AttemptAnswersModule {}
