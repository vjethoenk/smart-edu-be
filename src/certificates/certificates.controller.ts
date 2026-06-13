import { Controller, Get, Param, Res } from '@nestjs/common';
import { CertificatesService } from './certificates.service';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import type { IUser } from 'src/user/user.interface';
import * as express from 'express';

@Controller('certificates')
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Get('me')
  getMyCertificates(@User() user: IUser) {
    return this.certificatesService.getUserCertificates(user._id);
  }

  @Get('course/:courseId')
  @ResponseMessage('Nhận chứng chỉ thành công!')
  claim(@Param('courseId') courseId: string, @User() user: IUser) {
    return this.certificatesService.claimCertificate(user._id, courseId);
  }

  @Get('verify/:code')
  @Public()
  @ResponseMessage('Xác thực chứng chỉ thành công!')
  verify(@Param('code') code: string) {
    return this.certificatesService.verifyCertificate(code);
  }

  @Get(':code/view')
  @Public()
  async viewSvg(@Param('code') code: string, @Res() res: express.Response) {
    const svg = await this.certificatesService.getCertificateSvg(code);
    res.setHeader('Content-Type', 'image/svg+xml');
    res.send(svg);
  }
}
