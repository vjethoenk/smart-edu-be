import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-google-oauth20';
import { UserService } from 'src/user/user.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private usersService: UserService) {
    const callback =
      process.env.GOOGLE_CALLBACK_URL ||
      'http://localhost:8081/v1/auth/google/redirect';

    //console.log('CALLBACK URL =', callback);

    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL ||
        'http://localhost:8081/v1/auth/google/redirect',
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    const { name, emails, photos, id } = profile;

    let user = await this.usersService.findByEmail(emails[0].value);

    if (!user) {
      user = await this.usersService.createGoogleUser({
        email: emails[0].value,
        name: name.givenName || name.displayName,
        avatar: photos[0]?.value,
        googleId: id,
      });
    }

    return user;
  }
}
