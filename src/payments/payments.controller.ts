import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import type { IUser } from 'src/user/user.interface';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @ResponseMessage('Tạo đơn thanh toán PayOS thành công!')
  createPayment(
    @Body() createPaymentDto: CreatePaymentDto,
    @User() user: IUser,
  ) {
    return this.paymentsService.create(createPaymentDto, user);
  }

  @Public()
  @Post('webhook')
  @ResponseMessage('Nhận webhook từ PayOS!')
  handleWebhook(@Body() body: any) {
    return this.paymentsService.handleWebhook(body);
  }

  @Get(':id')
  @ResponseMessage('Lấy trạng thái thanh toán thành công!')
  getPayment(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }
}
