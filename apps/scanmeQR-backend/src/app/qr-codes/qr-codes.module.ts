import { Module } from '@nestjs/common';
import { QrCodesController } from './qr-codes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QrCode } from '../../../../../shared/data/src/lib/entities/qr-codes/qr-code.entity';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { QrCodesService } from '../../../../../shared/services/src/lib/qr-codes/qr-codes.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([QrCode]),
    SubscriptionsModule,
    AnalyticsModule,
  ],
  controllers: [QrCodesController],
  providers: [QrCodesService],
  exports: [QrCodesService],
})
export class QrCodesModule {}
