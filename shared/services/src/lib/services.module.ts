import { Module } from '@nestjs/common';
import { AuthService } from './auth/auth.service';
import { UsersService } from './users/users.service';
import { QrCodesService } from './qr-codes/qr-codes.service';
import { SubscriptionsService } from './subscriptions/subscriptions.service';
import { AnalyticsService } from './analytics/analytics.service';
import { JwtStrategyService } from './auth/strategies/jwt.strategy.service';
import { LocalStrategyService } from './auth/strategies/local.strategy.service';
import { JwtAuthGuardService } from './auth/guards/jwt-auth.guard.service';
import { LocalAuthGuardService } from './auth/guards/local-auth.guard.service';
import { RefreshStrategyService } from './auth/strategies/refresh.strategy.service';
import { RefreshAuthGuardService } from './auth/guards/refresh-auth.guard.service';
import { MasqueradeService } from './masquerade/masquerade.service';

@Module({
  controllers: [],
  providers: [
    AuthService,
    UsersService,
    QrCodesService,
    SubscriptionsService,
    AnalyticsService,
    JwtStrategyService,
    LocalStrategyService,
    JwtAuthGuardService,
    LocalAuthGuardService,
    RefreshStrategyService,
    RefreshAuthGuardService,
    MasqueradeService,
  ],
  exports: [],
})
export class ServicesModule {}
