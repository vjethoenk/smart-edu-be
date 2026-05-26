import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { RoleModule } from './role/role.module';
import { S3Service } from './common/services/s3/s3.service';
import { HlsService } from './common/services/hls/hls.service';
import { VideoModule } from './video/video.module';
import { UploadModule } from './upload/upload.module';
import { CoursesModule } from './courses/courses.module';
import { SectionsModule } from './sections/sections.module';
import { LessonsModule } from './lessons/lessons.module';
import { QuizzesModule } from './quizzes/quizzes.module';
import { QuestionsModule } from './questions/questions.module';
import { AttemptsModule } from './attempts/attempts.module';
import { AttemptAnswersModule } from './attempt-answers/attempt-answers.module';
import { PaymentsModule } from './payments/payments.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';
import { TrackingModule } from './tracking/tracking.module';
import { CartModule } from './cart/cart.module';
import { PromotionsModule } from './promotions/promotions.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),

    UserModule,

    AuthModule,

    CategoriesModule,

    RoleModule,

    VideoModule,

    UploadModule,

    CoursesModule,

    SectionsModule,

    LessonsModule,

    QuizzesModule,

    QuestionsModule,

    AttemptsModule,

    AttemptAnswersModule,

    PaymentsModule,

    EnrollmentsModule,

    TrackingModule,

    CartModule,

    PromotionsModule,

    ChatModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    S3Service,
    HlsService,
    // {
    //   provide: APP_GUARD,
    //   useClass: JwtAuthGuard,
    // },
  ],
})
export class AppModule {}
