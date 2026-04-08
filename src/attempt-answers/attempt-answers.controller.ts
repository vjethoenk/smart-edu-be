import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AttemptAnswersService } from './attempt-answers.service';
import { CreateAttemptAnswerDto } from './dto/create-attempt-answer.dto';
import { UpdateAttemptAnswerDto } from './dto/update-attempt-answer.dto';

@Controller('attempt-answers')
export class AttemptAnswersController {
  constructor(private readonly attemptAnswersService: AttemptAnswersService) {}

  @Post()
  create(@Body() createAttemptAnswerDto: CreateAttemptAnswerDto) {
    return this.attemptAnswersService.create(createAttemptAnswerDto);
  }

  @Get()
  findAll() {
    return this.attemptAnswersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.attemptAnswersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAttemptAnswerDto: UpdateAttemptAnswerDto) {
    return this.attemptAnswersService.update(+id, updateAttemptAnswerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.attemptAnswersService.remove(+id);
  }
}
