import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Certificate, CertificateDocument } from './schemas/certificate.schema';
import { CourseProgress, CourseProgressDocument } from 'src/tracking/schemas/course-progress.schema';
import { User, UserDocument } from 'src/user/schemas/user.schema';
import { Course, CourseDocument } from 'src/courses/schemas/course.schema';
import { getCertificateTemplate } from './templates/certificate-template';

@Injectable()
export class CertificatesService {
  constructor(
    @InjectModel(Certificate.name)
    private readonly certificateModel: Model<CertificateDocument>,
    @InjectModel(CourseProgress.name)
    private readonly courseProgressModel: Model<CourseProgressDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Course.name)
    private readonly courseModel: Model<CourseDocument>,
  ) { }

  private generateCode(): string {
    const year = new Date().getFullYear();
    const rand1 = Math.floor(1000 + Math.random() * 9000);
    const rand2 = Math.floor(1000 + Math.random() * 9000);
    return `SE-${year}-${rand1}-${rand2}`;
  }

  async claimCertificate(userId: string, courseId: string) {
    const progress = await this.courseProgressModel
      .findOne({
        userId: new Types.ObjectId(userId),
        courseId: courseId,
      })
      .exec();
    if (!progress || progress.progressPercent < 100) {
      const currentPercent = progress ? progress.progressPercent : 0;
      throw new BadRequestException(
        `Học viên chưa hoàn thành khóa học này. Tiến độ hiện tại: ${currentPercent}%.`,
      );
    }

    let certificate = await this.certificateModel
      .findOne({
        userId: new Types.ObjectId(userId),
        courseId: new Types.ObjectId(courseId),
      })
      .exec();

    if (!certificate) {
      let code = this.generateCode();
      let exists = await this.certificateModel
        .findOne({ certificateCode: code })
        .exec();

      while (exists) {
        code = this.generateCode();
        exists = await this.certificateModel
          .findOne({ certificateCode: code })
          .exec();
      }

      certificate = await this.certificateModel.create({
        userId: new Types.ObjectId(userId),
        courseId: new Types.ObjectId(courseId),
        certificateCode: code,
        issuedAt: new Date(),
      });
    }

    return this.certificateModel
      .findById(certificate._id)
      .populate('userId', 'name email')
      .populate('courseId', 'title')
      .exec();
  }

  async verifyCertificate(code: string) {
    const cert = await this.certificateModel
      .findOne({ certificateCode: code })
      .populate('userId', 'name email')
      .populate('courseId', 'title')
      .exec();

    if (!cert) {
      throw new NotFoundException(
        'Chứng chỉ không tồn tại hoặc mã xác thực không hợp lệ.',
      );
    }

    return {
      isValid: true,
      certificateCode: cert.certificateCode,
      studentName: (cert.userId as any)?.name || 'Học viên',
      courseTitle: (cert.courseId as any)?.title || 'Khóa học',
      issuedAt: cert.issuedAt,
    };
  }

  async getCertificateSvg(code: string): Promise<string> {
    const cert = await this.certificateModel
      .findOne({ certificateCode: code })
      .populate('userId', 'name')
      .populate('courseId', 'title')
      .exec();

    if (!cert) {
      throw new NotFoundException('Chứng chỉ không tồn tại.');
    }

    const studentName = (cert.userId as any)?.name || 'Học viên';
    const courseTitle = (cert.courseId as any)?.title || 'Khóa học';

    const day = cert.issuedAt.getDate().toString().padStart(2, '0');
    const month = (cert.issuedAt.getMonth() + 1).toString().padStart(2, '0');
    const year = cert.issuedAt.getFullYear();
    const issueDateStr = `${day}/${month}/${year}`;

    return getCertificateTemplate(
      studentName,
      courseTitle,
      issueDateStr,
      cert.certificateCode,
    );
  }
}
