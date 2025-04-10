import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QrCodeScan } from '../../../../../shared/data/src/lib/entities/analytics/qr-code-scan.entity';
import { AnalyticsService } from '../../../../../shared/services/src/lib/analytics/analytics.service';
import { UtilModule } from '../../../../../shared/util/src';

@Module({
  imports: [TypeOrmModule.forFeature([QrCodeScan]), UtilModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService]
})
export class AnalyticsModule {}
