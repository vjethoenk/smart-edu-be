import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IUser } from 'src/user/user.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        process.env.JWT_ACCESS_TOKEN_SECRET ||
        configService.get<string>('JWT_ACCESS_TOKEN_SECRET')!,
    });
  }
  async validate(payload: IUser) {
    // if (!payload?._id) {
    //   throw new UnauthorizedException('Invalid token payload');
    // }

    const { _id, name, email, role, isDeleted } = payload;
    console.log('DATA =', payload);
    return { _id, name, email, role, isDeleted };
  }
}
