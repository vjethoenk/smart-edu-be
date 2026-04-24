import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { IUser } from 'src/user/user.interface';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByUserName(username);
    if (user) {
      const isValid = this.usersService.checkUserPassword(
        pass,
        user?.password as string,
      );
      if (isValid === true) {
        return user;
      }
    }
    return null;
  }

  async login(user: any, response: Response) {
    const { _id, name, email, role, isDeleted } = user;
    const payload = {
      sub: 'token login',
      iss: 'from server',
      _id,
      name,
      email,
      role,
      isDeleted,
    };

    const refreshToken = await this.createRefreshToken(payload);
    await this.usersService.updateRefreshToken(refreshToken, _id);

    const refreshTokenExpire =
      this.configService.get<string>('JWT_REFRESH_EXPIRE');

    response.cookie('refresh-token', refreshToken, {
      httpOnly: true,
      maxAge: require('ms')(refreshTokenExpire!),
    });
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        _id,
        name,
        email,
        role,
        isDeleted,
      },
    };
  }

  createRefreshToken(payload: any): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET')!,
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRE') as any,
    });
  }

  async logout(user: IUser, response: Response) {
    await this.usersService.updateRefreshToken('', user._id);
    response.clearCookie('refresh-token');
    return { message: 'Logout successfully' };
  }
}
