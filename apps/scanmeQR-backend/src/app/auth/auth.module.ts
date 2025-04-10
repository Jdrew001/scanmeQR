import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from '../../../../../shared/services/src/lib/auth/auth.service';
import { UsersModule } from '../users/users.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { LocalStrategy } from '../../../../../shared/util/src/lib/auth/strategies/local.strategy';
import { JwtStrategy } from '../../../../../shared/util/src/lib/auth/strategies/jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import {
  RefreshStrategyService
} from '../../../../../shared/services/src/lib/auth/strategies/refresh.strategy.service';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    SubscriptionsModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_ACCESS_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    LocalStrategy,
    RefreshStrategyService
  ],
  exports: [AuthService],
})
export class AuthModule {}
