import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { BadRequestException, Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuid } from 'uuid';

@Injectable()
export class S3Service {
  private s3 = new S3Client({
    region: process.env.AWS_REGION || 'ap-southeast-2',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  async uploadFile(filePath: string, key: string) {
    const fileStream = fs.createReadStream(filePath);

    const extension = path.extname(filePath);
    const contentType =
      extension === '.m3u8' ? 'application/x-mpegURL' : 'video/mp2t';

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: key,
      Body: fileStream,
      ContentType: contentType,
    });

    await this.s3.send(command);

    return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    const region = process.env.AWS_REGION || 'ap-southeast-2';

    if (!bucketName) {
      throw new Error('Cấu hình AWS_S3_BUCKET_NAME bị thiếu trong file .env');
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Chỉ cho phép upload ảnh');
    }

    const fileName = `images/${Date.now()}-${uuid()}-${file.originalname}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    return `https://${bucketName}.s3.${region}.amazonaws.com/${fileName}`;
  }
}
