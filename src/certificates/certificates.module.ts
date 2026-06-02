import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CertificatesService } from './certificates.service';
import { CertificatesController } from './certificates.controller';
import { Certificate, CertificateSchema } from './schemas/certificate.schema';
import { CourseProgress, CourseProgressSchema } from 'src/tracking/schemas/course-progress.schema';
import { User, UserSchema } from 'src/user/schemas/user.schema';
import { Course, CourseSchema } from 'src/courses/schemas/course.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Certificate.name, schema: CertificateSchema },
      { name: CourseProgress.name, schema: CourseProgressSchema },
      { name: User.name, schema: UserSchema },
      { name: Course.name, schema: CourseSchema },
    ]),
  ],
  controllers: [CertificatesController],
  providers: [CertificatesService],
  exports: [CertificatesService],
})
export class CertificatesModule {}
