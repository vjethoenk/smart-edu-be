import { Injectable } from '@nestjs/common';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import path from 'path';
import fs from 'fs';

ffmpeg.setFfmpegPath(ffmpegPath as string);

@Injectable()
export class HlsService {
  async convertToHls(inputPath: string, outputDir: string) {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, 'index.m3u8');

    // console.log('Input:', inputPath);
    // console.log('Output:', outputPath);

    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .outputOptions([
          '-c:v libx264',
          '-c:a aac',
          '-preset veryfast',
          '-g 48',
          '-sc_threshold 0',
          '-hls_time 10',
          '-hls_list_size 0',
          '-f hls',
        ])
        .output(outputPath)
        .on('start', (cmd) => console.log('FFmpeg cmd:', cmd))
        .on('end', () => {
          console.log('✅ Convert HLS done');
          resolve(true);
        })
        .on('error', (err) => {
          console.error('❌ FFmpeg error:', err);
          reject(err);
        })
        .run();
    });
  }
}
