import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QrCodeScan } from '../../../../data/src/lib/entities/analytics/qr-code-scan.entity';
import { Between, Repository } from 'typeorm';
import useragent from 'useragent';

interface ScanData {
  ipAddress?: string;
  userAgent?: string;
  referer?: string;
  country?: string;
  city?: string;
}

interface DateRange {
  startDate: Date;
  endDate: Date;
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(QrCodeScan)
    private qrCodeScanRepository: Repository<QrCodeScan>,
  ) {}

  async trackScan(qrCodeId: string, scanData: ScanData): Promise<QrCodeScan> {
    // Parse user agent string
    let device = 'Unknown';
    let browser = 'Unknown';
    let os = 'Unknown';

    if (scanData.userAgent) {
      const agent = useragent.parse(scanData.userAgent);
      device = this.detectDevice(scanData.userAgent);
      browser = `${agent.family} ${agent.major}`;
      os = `${agent.os.family} ${agent.os.major}`;
    }

    const scan = this.qrCodeScanRepository.create({
      qrCode: { id: qrCodeId },
      ipAddress: scanData.ipAddress,
      userAgent: scanData.userAgent,
      referer: scanData.referer,
      country: scanData.country,
      city: scanData.city,
      device,
      browser,
      os,
    });

    return this.qrCodeScanRepository.save(scan);
  }

  // Detect device type from user agent string
  private detectDevice(userAgent: string): string {
    const ua = userAgent.toLowerCase();

    if (ua.includes('mobile')) {
      if (ua.includes('tablet') || ua.includes('ipad') || ua.includes('nexus 7') || ua.includes('kindle')) {
        return 'Tablet';
      }
      return 'Mobile';
    } else if (ua.includes('tablet') || ua.includes('ipad') || ua.includes('nexus 7') || ua.includes('kindle')) {
      return 'Tablet';
    }

    return 'Desktop';
  }

  async getScans(qrCodeId: string): Promise<QrCodeScan[]> {
    return this.qrCodeScanRepository.find({
      where: { qrCode: { id: qrCodeId } },
      order: { scanDate: 'DESC' },
    });
  }

  async getDailyScans(qrCodeId: string, range: DateRange): Promise<any[]> {
    const scans = await this.qrCodeScanRepository.find({
      where: {
        qrCode: { id: qrCodeId },
        scanDate: Between(range.startDate, range.endDate),
      },
    });

    // Group scans by date
    const dailyScans = {};
    scans.forEach(scan => {
      const date = scan.scanDate.toISOString().split('T')[0];
      if (!dailyScans[date]) {
        dailyScans[date] = 0;
      }
      dailyScans[date]++;
    });

    // Convert to array format for charts
    return Object.entries(dailyScans).map(([date, count]) => ({
      date,
      count,
    }));
  }

  async getDeviceBreakdown(qrCodeId: string): Promise<any[]> {
    const scans = await this.qrCodeScanRepository.find({
      where: { qrCode: { id: qrCodeId } },
    });

    // Group scans by device
    const deviceCounts = {};
    scans.forEach(scan => {
      if (!deviceCounts[scan.device]) {
        deviceCounts[scan.device] = 0;
      }
      deviceCounts[scan.device]++;
    });

    // Convert to array format for charts
    return Object.entries(deviceCounts).map(([device, count]) => ({
      device,
      count,
    }));
  }

  async getBrowserBreakdown(qrCodeId: string): Promise<any[]> {
    const scans = await this.qrCodeScanRepository.find({
      where: { qrCode: { id: qrCodeId } },
    });

    // Group scans by browser
    const browserCounts = {};
    scans.forEach(scan => {
      if (!browserCounts[scan.browser]) {
        browserCounts[scan.browser] = 0;
      }
      browserCounts[scan.browser]++;
    });

    // Convert to array format for charts
    return Object.entries(browserCounts).map(([browser, count]) => ({
      browser,
      count,
    }));
  }

  async getOsBreakdown(qrCodeId: string): Promise<any[]> {
    const scans = await this.qrCodeScanRepository.find({
      where: { qrCode: { id: qrCodeId } },
    });

    // Group scans by OS
    const osCounts = {};
    scans.forEach(scan => {
      if (!osCounts[scan.os]) {
        osCounts[scan.os] = 0;
      }
      osCounts[scan.os]++;
    });

    // Convert to array format for charts
    return Object.entries(osCounts).map(([os, count]) => ({
      os,
      count,
    }));
  }
}
