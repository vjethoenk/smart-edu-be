import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { SectionsService } from './sections.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import type { IUser } from 'src/user/user.interface';

@Controller('sections')
export class SectionsController {
  constructor(private readonly sectionsService: SectionsService) {}

  @Post()
  @ResponseMessage('Thêm chương học mới thành công!')
  create(@Body() createSectionDto: CreateSectionDto, @User() user: IUser) {
    return this.sectionsService.create(createSectionDto, user);
  }

  @Get(':id')
  @Public()
  @ResponseMessage('Hiển thị danh sách khóa học thành công!')
  findAll(@Param('id') id: string) {
    return this.sectionsService.findAll(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sectionsService.findOne(id);
  }

  @Put(':id')
  @ResponseMessage('Cập nhật chương học thành công!')
  update(
    @Param('id') id: string,
    @Body() updateSectionDto: UpdateSectionDto,
    @User() user: IUser,
  ) {
    return this.sectionsService.update(id, updateSectionDto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sectionsService.remove(id);
  }
}
