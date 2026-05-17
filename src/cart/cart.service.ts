import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { Cart, CartDocument } from './schemas/cart.schema';
import { Course, CourseDocument } from 'src/courses/schemas/course.schema';
import {
  Promotion,
  PromotionDocument,
} from 'src/promotions/schemas/promotion.schema';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectModel(Promotion.name)
    private promotionModel: Model<PromotionDocument>,
  ) {}

  async create(createCartDto: CreateCartDto, userId: string) {
    const { courseId, price, promotionId } = createCartDto;

    // Check if course exists
    const course = await this.courseModel.findById(courseId);
    if (!course) {
      throw new NotFoundException('Khóa học không tồn tại');
    }

    // Check if item already exists in cart
    const existingCart = await this.cartModel.findOne({
      userId: new Types.ObjectId(userId),
      courseId: new Types.ObjectId(courseId),
    });

    if (existingCart) {
      throw new BadRequestException('Khóa học này đã có trong giỏ hàng');
    }

    const cartPrice = price || parseFloat(course.price);
    let discount = 0;
    let discountAmount = 0;
    let promotionObjectId: Types.ObjectId | undefined;

    if (promotionId) {
      const promotion = await this.promotionModel.findById(promotionId);
      if (!promotion) {
        throw new NotFoundException('Khuyến mãi không tồn tại');
      }
      if (
        !promotion.isActive ||
        new Date() < promotion.startDate ||
        new Date() > promotion.endDate
      ) {
        throw new BadRequestException('Khuyến mãi không còn hợp lệ');
      }

      discount = promotion.discountPercentage;
      discountAmount = (cartPrice * discount) / 100;
      promotionObjectId = new Types.ObjectId(promotionId);
    }

    const totalPrice = cartPrice - discountAmount;

    const cart = new this.cartModel({
      userId: new Types.ObjectId(userId),
      courseId: new Types.ObjectId(courseId),
      price: cartPrice,
      discount,
      discountAmount,
      totalPrice,
      promotionId: promotionObjectId,
    });

    return cart.save();
  }

  async findByUserId(userId: string) {
    return this.cartModel
      .find({ userId: new Types.ObjectId(userId) })
      .populate('courseId', 'title thumbnail price description')
      .populate('promotionId', 'code discountPercentage')
      .sort({ addedAt: -1 })
      .exec();
  }

  async findOne(cartId: string, userId: string) {
    const cart = await this.cartModel
      .findOne({
        _id: new Types.ObjectId(cartId),
        userId: new Types.ObjectId(userId),
      })
      .populate('courseId')
      .populate('promotionId')
      .exec();

    if (!cart) {
      throw new NotFoundException('Giỏ hàng không tồn tại');
    }

    return cart;
  }

  async update(cartId: string, updateCartDto: UpdateCartDto, userId: string) {
    const cart = await this.findOne(cartId, userId);

    if (updateCartDto.promotionId) {
      const promotion = await this.promotionModel.findById(
        updateCartDto.promotionId,
      );

      if (!promotion) {
        throw new NotFoundException('Khuyến mãi không tồn tại');
      }

      if (!promotion.isActive || new Date() > promotion.endDate) {
        throw new BadRequestException('Khuyến mãi không còn hợp lệ');
      }

      const discount = promotion.discountPercentage;
      const discountAmount = (cart.price * discount) / 100;
      const totalPrice = cart.price - discountAmount;

      return this.cartModel.findByIdAndUpdate(
        cartId,
        {
          promotionId: new Types.ObjectId(updateCartDto.promotionId),
          discount,
          discountAmount,
          totalPrice,
        },
        { new: true },
      );
    }

    return this.cartModel.findByIdAndUpdate(cartId, updateCartDto, {
      new: true,
    });
  }

  async remove(cartId: string, userId: string) {
    const cart = await this.findOne(cartId, userId);
    return this.cartModel.findByIdAndDelete(cartId).exec();
  }

  async removeAll(userId: string) {
    return this.cartModel.deleteMany({
      userId: new Types.ObjectId(userId),
    });
  }

  async getCartTotal(userId: string) {
    const carts = await this.cartModel.aggregate([
      {
        $match: { userId: new Types.ObjectId(userId) },
      },
      {
        $group: {
          _id: null,
          totalItems: { $sum: 1 },
          totalPrice: { $sum: '$totalPrice' },
          totalDiscount: { $sum: '$discountAmount' },
        },
      },
    ]);

    if (carts.length === 0) {
      return {
        totalItems: 0,
        totalPrice: 0,
        totalDiscount: 0,
      };
    }

    return carts[0];
  }
}
