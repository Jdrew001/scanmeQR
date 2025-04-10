import { Injectable, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from '../../../../data/src/lib/dto/auth/register.dto';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { SubscriptionPlan } from '../../../../data/src/lib/entities/subscriptions/subscription.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private subscriptionsService: SubscriptionsService
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);

    if (user && await bcrypt.compare(password, user.password!)) {
      const { password, ...result } = user;
      return result;
    }

    return null;
  }

  async login(user: any) {
    const tokens = await this.getTokens(user.id, user.email, user.role);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.usersService.findOne(userId);

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Access denied');
    }

    const refreshTokenMatches = await bcrypt.compare(
      refreshToken,
      user.refreshToken
    );

    if (!refreshTokenMatches) {
      throw new UnauthorizedException('Access denied');
    }

    const tokens = await this.getTokens(user.id, user.email, user.role);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async logout(userId: string) {
    // Remove refresh token from user
    return this.usersService.update(userId, { refreshToken: null });
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    // Hash the refresh token before storing it
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.usersService.update(userId, {
      refreshToken: hashedRefreshToken,
    });
  }

  async getProfile(userId: string) {
    const user = await this.usersService.findOne(userId);
    const subscription = await this.subscriptionsService.findOneByUserId(userId);

    // Remove sensitive information before returning to client
    const { password, refreshToken, ...userInfo } = user;

    return {
      user: userInfo,
      subscription: {
        plan: subscription.plan,
        status: subscription.status,
        maxQrCodes: subscription.maxQrCodes,
        maxScansPerQr: subscription.maxScansPerQr,
        isDynamicAllowed: subscription.isDynamicAllowed,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
      },
    };
  }

  async getTokens(userId: string, email: string, role: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
          role,
        },
        {
          secret: process.env.JWT_ACCESS_SECRET,
          expiresIn: '15m', // Short-lived access token
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
          role,
        },
        {
          secret: process.env.JWT_REFRESH_SECRET,
          expiresIn: '7d', // Longer-lived refresh token
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async register(registerDto: RegisterDto) {
    // Create the user
    const user = await this.usersService.create(registerDto);

    // Generate access and refresh tokens
    const tokens = await this.getTokens(user.id, user.email, user.role);

    // Store the refresh token
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    // Return tokens and user information
    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }
}
