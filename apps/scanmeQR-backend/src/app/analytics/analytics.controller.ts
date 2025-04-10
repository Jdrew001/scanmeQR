import { Controller, Get, Param, UseGuards, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../../shared/util/src/lib/auth/guards/jwt-auth.guard';
import { AnalyticsService } from '../../../../../shared/services/src/lib/analytics/analytics.service';

@ApiTags('analytics')
@Controller('analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('qr-code/:id/scans')
  @ApiOperation({ summary: 'Get all scans for a QR code' })
  @ApiResponse({ status: 200, description: 'Return all scans.' })
  getScans(@Param('id') id: string) {
    return this.analyticsService.getScans(id);
  }

  @Get('qr-code/:id/daily-scans')
  @ApiOperation({ summary: 'Get daily scan counts for a QR code' })
  @ApiResponse({ status: 200, description: 'Return daily scan counts.' })
  getDailyScans(
    @Param('id') id: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.analyticsService.getDailyScans(id, {
      startDate: startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: endDate ? new Date(endDate) : new Date(),
    });
  }

  @Get('qr-code/:id/device-breakdown')
  @ApiOperation({ summary: 'Get device breakdown for a QR code' })
  @ApiResponse({ status: 200, description: 'Return device breakdown.' })
  getDeviceBreakdown(@Param('id') id: string) {
    return this.analyticsService.getDeviceBreakdown(id);
  }

  @Get('qr-code/:id/browser-breakdown')
  @ApiOperation({ summary: 'Get browser breakdown for a QR code' })
  @ApiResponse({ status: 200, description: 'Return browser breakdown.' })
  getBrowserBreakdown(@Param('id') id: string) {
    return this.analyticsService.getBrowserBreakdown(id);
  }

  @Get('qr-code/:id/os-breakdown')
  @ApiOperation({ summary: 'Get OS breakdown for a QR code' })
  @ApiResponse({ status: 200, description: 'Return OS breakdown.' })
  getOsBreakdown(@Param('id') id: string) {
    return this.analyticsService.getOsBreakdown(id);
  }
}
