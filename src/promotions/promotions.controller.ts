import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PromotionsService } from './promotions.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import type { IUser } from 'src/user/user.interface';

@Controller('promotions')
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Post()
  @ResponseMessage('Thêm khuyến mãi thành công!')
  create(@Body() createPromotionDto: CreatePromotionDto, @User() user: IUser) {
    return this.promotionsService.create(createPromotionDto, user);
  }

  @Get()
  @Public()
  @ResponseMessage('Lấy danh sách khuyến mãi thành công!')
  findAll() {
    return this.promotionsService.findAll();
  }

  @Get('by-code/:code')
  @Public()
  @ResponseMessage('Lấy khuyến mãi theo mã thành công!')
  findByCode(@Param('code') code: string) {
    return this.promotionsService.findByCode(code);
  }

  @Get('by-course/:courseId')
  @Public()
  @ResponseMessage('Lấy khuyến mãi theo khóa học thành công!')
  findByCourse(@Param('courseId') courseId: string) {
    return this.promotionsService.findByCourse(courseId);
  }

  @Get(':id')
  @Public()
  @ResponseMessage('Lấy chi tiết khuyến mãi thành công!')
  findOne(@Param('id') id: string) {
    return this.promotionsService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Cập nhật khuyến mãi thành công!')
  update(
    @Param('id') id: string,
    @Body() updatePromotionDto: UpdatePromotionDto,
    @User() user: IUser,
  ) {
    return this.promotionsService.update(id, updatePromotionDto, user);
  }

  @Delete(':id')
  @ResponseMessage('Xóa khuyến mãi thành công!')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.promotionsService.remove(id, user);
  }
}
