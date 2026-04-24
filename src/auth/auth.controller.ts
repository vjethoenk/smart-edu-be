import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import type { IUser } from 'src/user/user.interface';
import type { Request, Response } from 'express';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    // private roleService: RoleService,
    // private readonly mailerService: MailerService,
  ) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @ResponseMessage('Login success')
  @Public()
  async login(@Req() req, @Res({ passthrough: true }) response: Response) {
    return this.authService.login(req.user, response);
  }

  @ResponseMessage('Get user information')
  @Get('account')
  async handleGetAccount(@User() user: IUser) {
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return { user };
  }

  @Get('refresh')
  @Public()
  @ResponseMessage('Get user by refresh token')
  handleRefreshToken(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies['refresh-token'];
    // return this.authService.newToken(refreshToken, response);
  }

  @Get('google')
  @Public()
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Passport will redirect to Google
  }

  @Get('google/redirect')
  @Public()
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() response: Response) {
    const data = await this.authService.login(req.user, response);
    return response.redirect(
      `http://localhost:3000/auth/callback/google?access_token=${data.access_token}&role=${data.user.role.name}`,
    );
  }

  @Post('logout')
  @ResponseMessage('Logout success')
  async logout(
    @User() user: IUser,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.logout(user, response);
  }
}
