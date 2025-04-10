import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from '../../../../../shared/services/src/lib/auth/auth.service';
import { UsersModule } from '../users/users.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import {
  RefreshStrategyService
} from '../../../../../shared/services/src/lib/auth/strategies/refresh.strategy.service';
import { JwtAuthGuardService } from '../../../../../shared/services/src/lib/auth/guards/jwt-auth.guard.service';
import { LocalStrategyService } from '../../../../../shared/services/src/lib/auth/strategies/local.strategy.service';
import { JwtStrategyService } from '../../../../../shared/services/src/lib/auth/strategies/jwt.strategy.service';
import { MasqueradeController } from '../masquerade/masquerade.controller';
import { MasqueradeService } from '../../../../../shared/services/src/lib/masquerade/masquerade.service';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    SubscriptionsModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
    }),
  ],
  controllers: [AuthController, MasqueradeController],
  providers: [
    AuthService,
    JwtStrategyService,
    LocalStrategyService,
    RefreshStrategyService,
    MasqueradeService
  ],
  exports: [AuthService, MasqueradeService],
})
export class AuthModule {}
