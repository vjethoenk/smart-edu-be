import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Payment, PaymentDocument } from './schemas/payment.schema';
import { createHmac } from 'crypto';
import { PayOS } from '@payos/node';

@Injectable()
export class PaymentsService {
  private payOS: any;

  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    private configService: ConfigService,
  ) {
    const clientId = this.configService.get<string>('PAYOS_CLIENT_ID');
    const apiKey = this.configService.get<string>('PAYOS_API_KEY');
    const checksumKey = this.configService.get<string>('PAYOS_CHECKSUM_KEY');

    if (!clientId || !apiKey || !checksumKey) {
      throw new Error(
        'Thiếu cấu hình PayOS: PAYOS_CLIENT_ID, PAYOS_API_KEY, PAYOS_CHECKSUM_KEY',
      );
    }

    this.payOS = new PayOS({
      clientId,
      apiKey,
      checksumKey,
    });
  }

  async create(createPaymentDto: CreatePaymentDto, user: any) {
    const {
      amount,
      courseId,
      orderInfo = 'Thanh toán khóa học',
    } = createPaymentDto;

    // Tạo orderCode duy nhất (PayOS yêu cầu number)
    const orderCode = Date.now();

    const paymentData = {
      orderCode,
      amount,
      description: orderInfo,
      returnUrl:
        this.configService.get<string>('PAYOS_RETURN_URL') ||
        'http://localhost:3000/payments/success',
      cancelUrl:
        this.configService.get<string>('PAYOS_CANCEL_URL') ||
        'http://localhost:3000/payments/cancel',
    };

    try {
      const paymentLinkResponse =
        await this.payOS.paymentRequests.create(paymentData);

      const payment = await this.paymentModel.create({
        user: {
          _id: user._id,
          email: user.email,
          name: user.name,
        },
        courseId,
        amount,
        orderCode,
        checkoutUrl: paymentLinkResponse.checkoutUrl,
        orderInfo,
        status: 'PENDING',
      });

      return {
        message: 'Đã tạo thanh toán PayOS thành công.',
        data: {
          paymentId: payment._id,
          orderCode: payment.orderCode,
          amount: payment.amount,
          status: payment.status,
          checkoutUrl: payment.checkoutUrl,
          qrCode: paymentLinkResponse.qrCode,
        },
      };
    } catch (error: any) {
      throw new BadRequestException(
        'Tạo thanh toán PayOS thất bại: ' + error?.message,
      );
    }
  }

  async findOne(id: string) {
    const payment = await this.paymentModel.findById(id).exec();
    if (!payment) {
      throw new NotFoundException('Không tìm thấy đơn thanh toán');
    }
    return payment;
  }

  async handleWebhook(webhookData: any) {
    // Verify checksum
    const {
      orderCode,
      amount,
      description,
      accountNumber,
      reference,
      transactionDateTime,
      paymentLinkId,
      code,
      desc,
      counterAccountBankId,
      counterAccountBankName,
      counterAccountName,
      counterAccountNumber,
      virtualAccountName,
      virtualAccountNumber,
    } = webhookData;

    const data = `${orderCode}|${amount}|${description}|${accountNumber}|${reference}|${transactionDateTime}|${paymentLinkId}|${code}|${desc}|${counterAccountBankId}|${counterAccountBankName}|${counterAccountName}|${counterAccountNumber}|${virtualAccountName}|${virtualAccountNumber}`;
    const checksum = createHmac(
      'sha256',
      this.configService.get<string>('PAYOS_CHECKSUM_KEY')!,
    )
      .update(data)
      .digest('hex');

    if (checksum !== webhookData.checksum) {
      throw new BadRequestException('Checksum không hợp lệ');
    }

    // Tìm payment theo orderCode
    const payment = await this.paymentModel.findOne({ orderCode }).exec();
    if (!payment) {
      throw new NotFoundException(
        'Không tìm thấy đơn thanh toán với orderCode: ' + orderCode,
      );
    }

    // Cập nhật status
    if (code === '00') {
      payment.status = 'SUCCESS';
      payment.transactionId = reference;
      payment.confirmedAt = new Date();
    } else {
      payment.status = 'FAILED';
    }

    await payment.save();

    return {
      message:
        payment.status === 'SUCCESS'
          ? 'Thanh toán thành công'
          : 'Thanh toán thất bại',
      data: {
        paymentId: payment._id,
        orderCode: payment.orderCode,
        status: payment.status,
        transactionId: payment.transactionId,
      },
    };
  }
}
