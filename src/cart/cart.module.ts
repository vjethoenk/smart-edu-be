import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { Cart, CartSchema } from './schemas/cart.schema';
import { Course, CourseSchema } from 'src/courses/schemas/course.schema';
import {
  Promotion,
  PromotionSchema,
} from 'src/promotions/schemas/promotion.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Cart.name, schema: CartSchema },
      { name: Course.name, schema: CourseSchema },
      { name: Promotion.name, schema: PromotionSchema },
    ]),
  ],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}
