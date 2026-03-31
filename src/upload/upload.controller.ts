import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UploadService } from './upload.service';
import { S3Service } from 'src/common/services/s3/s3.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Public } from 'src/decorator/customize';

@Controller('upload')
export class UploadController {
  constructor(private readonly s3Service: S3Service) {}

  @Post('image')
  @Public()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 2 * 1024 * 1024 },
    }),
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    const url = await this.s3Service.uploadImage(file);
    return { url };
  }
}
