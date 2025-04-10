import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategyService extends PassportStrategy(
  Strategy,
  'jwt',
) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET', 'supersecret'),
    });
  }

  async validate(payload: any) {
    // Include masquerade info if present
    if (payload.masquerading && payload.originalUserId) {
      return {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
        timezone: payload.timezone,
        masquerading: true,
        originalUserId: payload.originalUserId
      };
    }

    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      timezone: payload.timezone
    };
  }
}
