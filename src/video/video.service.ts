import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Video, VideoDocument } from './schemas/video.schema';
import { Model } from 'mongoose';
import { HlsService } from 'src/common/services/hls/hls.service';
import { S3Service } from 'src/common/services/s3/s3.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class VideoService {
  private readonly logger = new Logger(VideoService.name);

  constructor(
    private s3Service: S3Service,
    private hlsService: HlsService,
    @InjectModel(Video.name) private videoModel: Model<VideoDocument>,
  ) {}

  async uploadVideo(file: Express.Multer.File) {
    const videoId = Date.now().toString();
    const inputPath = path.resolve(file.path);
    const outputDir = path.resolve('uploads', 'hls', videoId);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    try {
      this.logger.log(`Bắt đầu convert HLS cho video: ${videoId}`);

      // Convert sang HLS
      await this.hlsService.convertToHls(inputPath, outputDir);

      const files = fs.readdirSync(outputDir);
      let hlsUrl = '';

      this.logger.log(`Bắt đầu upload ${files.length} files lên S3...`);

      //Upload từng file lên S3
      for (const fileName of files) {
        const filePath = path.join(outputDir, fileName);
        const key = `videos/${videoId}/${fileName}`;

        const url = await this.s3Service.uploadFile(filePath, key);

        if (fileName === 'index.m3u8') {
          hlsUrl = url;
        }
      }

      fs.rmSync(outputDir, { recursive: true, force: true });
      if (fs.existsSync(inputPath)) {
        fs.unlinkSync(inputPath);
      }

      this.logger.log(`Hoàn thành và dọn dẹp thư mục: ${videoId}`);

      return await this.videoModel.create({
        title: file.originalname,
        hlsUrl: hlsUrl,
      });
    } catch (error: any) {
      this.logger.error(`Lỗi xử lý video: ${error.message}`);
      if (fs.existsSync(outputDir)) {
        fs.rmSync(outputDir, { recursive: true, force: true });
      }
      throw error;
    }
  }
}
