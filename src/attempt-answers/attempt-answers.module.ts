import { Module } from '@nestjs/common';
import { AttemptAnswersService } from './attempt-answers.service';
import { AttemptAnswersController } from './attempt-answers.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AttemptAnswer,
  AttemptAnswerSchema,
} from './schemas/attempt-answer.schema';
import { QuizzesModule } from 'src/quizzes/quizzes.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AttemptAnswer.name, schema: AttemptAnswerSchema },
    ]),
    QuizzesModule,
  ],
  controllers: [AttemptAnswersController],
  providers: [AttemptAnswersService],
  exports: [AttemptAnswersService],
})
export class AttemptAnswersModule {}
