import { Controller, Get, NotFoundException, Param, Req, Res, Request, Response } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { QrCodesService } from '../../../../../shared/services/src/lib/qr-codes/qr-codes.service';
import { AnalyticsService } from '../../../../../shared/services/src/lib/analytics/analytics.service';

@ApiTags('redirect')
@Controller('redirect')
export class RedirectController {
  constructor(
    private readonly qrCodesService: QrCodesService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  @Get(':id')
  @ApiOperation({ summary: 'Redirect from QR code scan' })
  async redirect(@Param('id') id: string, @Req() req: any, @Res() res: any) {
    try {
      // Find QR code and increment scan count
      const qrCode = await this.qrCodesService.incrementScanCount(id);

      // Track scan analytics
      await this.analyticsService.trackScan(qrCode.id, {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        referer: req.headers.referer,
      });

      // Redirect to the target URL
      return res.redirect(qrCode.targetUrl);
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        return res.status(404).send('QR code not found');
      }

      if (error.message.includes('maximum number of scans')) {
        return res.status(403).send('This QR code has reached its scan limit');
      }

      if (error.message.includes('no longer active')) {
        return res.status(403).send('This QR code is no longer active');
      }

      return res.status(500).send('An error occurred');
    }
  }
}
