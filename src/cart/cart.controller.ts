import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { ResponseMessage, User } from 'src/decorator/customize';
import type { IUser } from 'src/user/user.interface';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  @ResponseMessage('Thêm khóa học vào giỏ hàng thành công!')
  create(@Body() createCartDto: CreateCartDto, @User() user: IUser) {
    return this.cartService.create(createCartDto, user._id.toString());
  }

  @Get()
  @ResponseMessage('Lấy giỏ hàng thành công!')
  findByUser(@User() user: IUser) {
    return this.cartService.findByUserId(user._id.toString());
  }

  @Get('total')
  @ResponseMessage('Lấy tổng giỏ hàng thành công!')
  getCartTotal(@User() user: IUser) {
    return this.cartService.getCartTotal(user._id.toString());
  }

  @Get(':id')
  @ResponseMessage('Lấy chi tiết giỏ hàng thành công!')
  findOne(@Param('id') id: string, @User() user: IUser) {
    return this.cartService.findOne(id, user._id.toString());
  }

  @Patch(':id')
  @ResponseMessage('Cập nhật giỏ hàng thành công!')
  update(
    @Param('id') id: string,
    @Body() updateCartDto: UpdateCartDto,
    @User() user: IUser,
  ) {
    return this.cartService.update(id, updateCartDto, user._id.toString());
  }

  @Delete(':id')
  @ResponseMessage('Xóa khóa học khỏi giỏ hàng thành công!')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.cartService.remove(id, user._id.toString());
  }

  @Delete()
  @ResponseMessage('Xóa toàn bộ giỏ hàng thành công!')
  removeAll(@User() user: IUser) {
    return this.cartService.removeAll(user._id.toString());
  }
}
