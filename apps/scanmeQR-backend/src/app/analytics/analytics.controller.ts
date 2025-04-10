import { Controller, Get, Param, UseGuards, Query, BadRequestException } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AnalyticsService } from '../../../../../shared/services/src/lib/analytics/analytics.service';
import { JwtAuthGuardService } from '../../../../../shared/services/src/lib/auth/guards/jwt-auth.guard.service';
import { TimezoneService } from '../../../../../shared/util/src/lib/timezone/timezone.service';

@ApiTags('analytics')
@Controller('analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuardService)
export class AnalyticsController {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly timezoneService: TimezoneService
    ) {}

  @Get('qr-code/:id/scans')
  @ApiOperation({ summary: 'Get all scans for a QR code' })
  @ApiResponse({ status: 200, description: 'Return all scans.' })
  getScans(@Param('id') id: string) {
    return this.analyticsService.getScans(id);
  }

  @Get('qr-code/:id/daily-scans')
  @ApiOperation({ summary: 'Get daily scan counts for a QR code' })
  @ApiResponse({ status: 200, description: 'Return daily scan counts.' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date in ISO format (YYYY-MM-DD) or relative format (e.g., "7d" for 7 days ago)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date in ISO format (YYYY-MM-DD) or "today"' })
  @ApiQuery({ name: 'interval', required: false, enum: ['day', 'week', 'month'], description: 'Aggregation interval' })
  @ApiQuery({ name: 'timezone', required: false, description: 'Override timezone (e.g., "America/New_York")' })
  async getDailyScans(
    @Param('id') id: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('interval') interval: 'day' | 'week' | 'month' = 'day'
  ) {
    try {
      // Parse start date with default to 30 days ago
      let parsedStartDate: Date;
      if (!startDate) {
        // Default to 30 days ago
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        parsedStartDate = await this.timezoneService.setToStartOfDay(thirtyDaysAgo);
      } else {
        parsedStartDate = await this.timezoneService.parseDate(startDate);
      }

      // Parse end date with default to today
      let parsedEndDate: Date;
      if (!endDate || endDate.toLowerCase() === 'today') {
        parsedEndDate = await this.timezoneService.setToEndOfDay(new Date());
      } else {
        parsedEndDate = await this.timezoneService.parseDate(endDate, { endOfDay: true });
      }

      // Validate date range
      if (parsedStartDate > parsedEndDate) {
        throw new BadRequestException('startDate cannot be later than endDate');
      }

      // Get the current timezone for analytics
      const timezone = await this.timezoneService.getUserTimezone();

      // Get scans
      return this.analyticsService.getDailyScans(id, {
        startDate: parsedStartDate,
        endDate: parsedEndDate,
        interval,
        timezone
      });
    } catch (error) {
      throw new BadRequestException((error as any).message);
    }
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
