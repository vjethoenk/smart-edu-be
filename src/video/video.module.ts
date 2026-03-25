import { Module } from '@nestjs/common';
import { VideoService } from './video.service';
import { VideoController } from './video.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Video, VideoSchema } from './schemas/video.schema';
import { S3Service } from 'src/common/services/s3/s3.service';
import { HlsService } from 'src/common/services/hls/hls.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Video.name, schema: VideoSchema }]),
  ],
  controllers: [VideoController],
  providers: [VideoService, S3Service, HlsService],
})
export class VideoModule {}
