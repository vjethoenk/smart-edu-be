import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Payment, PaymentDocument } from './schemas/payment.schema';
import { PayOS } from '@payos/node';
import {
  Enrollment,
  EnrollmentDocument,
} from '../enrollments/schemas/enrollment.schema';
import { PromotionsService } from '../promotions/promotions.service';

@Injectable()
export class PaymentsService {
  private payOS: any;

  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(Enrollment.name)
    private enrollmentModel: Model<EnrollmentDocument>,
    private configService: ConfigService,
    private promotionsService: PromotionsService,
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
      promotionId,
    } = createPaymentDto;

    // Validate promotion if provided, or find active promotion automatically
    let resolvedPromotionId: Types.ObjectId | undefined = undefined;
    if (promotionId) {
      const promotion = await this.promotionsService.validatePromotion(
        promotionId,
        courseId,
      );
      resolvedPromotionId = promotion._id as Types.ObjectId;
    } else {
      const activePromotion =
        await this.promotionsService.findActivePromotionForCourse(courseId);
      if (activePromotion) {
        resolvedPromotionId = activePromotion._id as Types.ObjectId;
      }
    }

    const orderCode = Date.now();

    const paymentData = {
      orderCode,
      amount,
      description: orderInfo,
      returnUrl:
        this.configService.get<string>('PAYOS_RETURN_URL') ||
        'https://smart-edu-fe.vercel.app/payments/success',
      cancelUrl:
        this.configService.get<string>('PAYOS_CANCEL_URL') ||
        'https://smart-edu-fe.vercel.app/payments/cancel',
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
        promotionId: resolvedPromotionId,
      });

      return {
        paymentId: payment._id,
        orderCode: payment.orderCode,
        amount: payment.amount,
        status: payment.status,
        checkoutUrl: payment.checkoutUrl,
        qrCode: paymentLinkResponse.qrCode,
      };
    } catch (error: any) {
      throw new BadRequestException(
        'Tạo thanh toán PayOS thất bại: ' + error?.message,
      );
    }
  }

  async findOne(_id: string) {
    const payment = await this.paymentModel.findById(_id).exec();
    if (!payment) {
      throw new NotFoundException('Không tìm thấy đơn thanh toán');
    }
    return payment;
  }

  async handleWebhook(webhookData: any) {
    console.log('FULL WEBHOOK:', JSON.stringify(webhookData, null, 2));

    let payload: any;
    try {
      payload = await this.payOS.webhooks.verify(webhookData);
      console.log('PAYOS WEBHOOK VERIFIED:', JSON.stringify(payload, null, 2));
    } catch (error: any) {
      console.error('PAYOS WEBHOOK VERIFY FAILED:', error?.message || error);
      return { message: 'Invalid signature' };
    }

    const payment = await this.paymentModel.findOne({
      orderCode: payload.orderCode,
    });

    if (!payment) {
      console.error('PAYMENT NOT FOUND');
      return { message: 'Payment not found' };
    }

    if (payment.status === 'SUCCESS') {
      return { message: 'Already processed' };
    }

    if (payment.status === 'CANCELLED') {
      return { message: 'Đã bị hủy trước đó' };
    }

    if (payload.code === '00') {
      payment.status = 'SUCCESS';
      payment.transactionId = payload.reference;
      payment.confirmedAt = new Date();

      await this.enrollmentModel.create({
        userId: payment.user._id,
        courseId: payment.courseId,
        paymentId: payment._id,
        status: 'ACTIVE',
        enrolledAt: new Date(),
      });

      if (payment.promotionId) {
        await this.promotionsService.incrementUsageCount(
          payment.promotionId.toString(),
        );
      }
    } else {
      payment.status = 'FAILED';
    }

    await payment.save();

    // console.log('PAYMENT UPDATED:', payment.status);

    return { message: 'OK' };
  }

  async cancelPayment(orderCode: number) {
    const payment = await this.paymentModel.findOne({ orderCode });

    if (!payment) {
      throw new NotFoundException('Không tìm thấy đơn thanh toán');
    }

    if (payment.status === 'SUCCESS') {
      throw new BadRequestException('Đơn đã thanh toán, không thể hủy');
    }

    try {
      await this.payOS.paymentRequests.cancel(orderCode);
    } catch (error: any) {
      console.error('Cancel PayOS error:', error?.message);
    }

    payment.status = 'CANCELLED';
    await payment.save();

    return {
      message: 'Đã hủy giao dịch',
      data: {
        orderCode,
        status: payment.status,
      },
    };
  }

  async getPaymentStatus(orderCode: number) {
    let payment = await this.paymentModel.findOne({ orderCode });

    if (!payment) throw new NotFoundException('Không tìm thấy đơn hàng');

    if (payment.status === 'PENDING') {
      try {
        const payosOrder = await this.payOS.paymentRequests.getPaymentLinkInformation(orderCode);
        if (payosOrder.status === 'PAID') {
          payment.status = 'SUCCESS';
          await payment.save();

          if (payment.promotionId) {
            await this.promotionsService.incrementUsageCount(
              payment.promotionId.toString(),
            );
          }
        }
      } catch (error) {
        console.error('Lỗi khi check trạng thái PayOS:', error);
      }
    }

    return { status: payment.status };
  }

  async findAll() {
    return this.paymentModel
      .find()
      .populate({
        path: 'courseId',
        model: 'Course',
        select: 'title thumbnail price description level',
      })
      .sort({ createdAt: -1 })
      .exec();
  }
}
