import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QrCodeScan } from '../../../../data/src/lib/entities/analytics/qr-code-scan.entity';
import { Between, Repository } from 'typeorm';
import useragent from 'useragent';
import { TimezoneService } from '../../../../util/src/lib/timezone/timezone.service';

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
    private timezoneService: TimezoneService
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

  async getDailyScans(qrCodeId: string, options: {
    startDate: Date;
    endDate: Date;
    interval?: 'day' | 'week' | 'month';
    timezone: string;
  }): Promise<any[]> {
    const { startDate, endDate, interval = 'day', timezone } = options;

    console.log(`Fetching scans with range:`, {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      interval,
      timezone
    });

    // First, get the raw scans from the database
    const scans = await this.qrCodeScanRepository.find({
      where: {
        qrCode: { id: qrCodeId },
        scanDate: Between(startDate, endDate),
      },
    });

    console.log(`Found ${scans.length} scans in the database`);

    if (scans.length > 0) {
      console.log('Sample scan dates:', scans.slice(0, 3).map(s => s.scanDate));
    }

    // Group scans by interval using the user's timezone
    const groupedScans = {};

    // Create a date formatter for the user's timezone
    const dateFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

    // Create a month formatter for the user's timezone
    const monthFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
    });

    scans.forEach(scan => {
      // Format the scan date in the user's timezone
      const scanDate = new Date(scan.scanDate);
      let dateKey: string;

      switch(interval) {
        case 'week':
          // Get the date parts in user's timezone
          const dateParts = dateFormatter.formatToParts(scanDate);
          const year = dateParts.find(part => part.type === 'year')?.value || '';
          const month = dateParts.find(part => part.type === 'month')?.value || '';
          const day = dateParts.find(part => part.type === 'day')?.value || '';

          // Create a Date object in user's timezone to calculate the week
          const localDate = new Date(`${year}-${month}-${day}T12:00:00`);

          // Get the first day of the week (Sunday)
          const dayOfWeek = localDate.getDay();
          const weekStartDate = new Date(localDate);
          weekStartDate.setDate(localDate.getDate() - dayOfWeek);

          // Format the week start date
          const weekStart = dateFormatter.formatToParts(weekStartDate);
          const weekStartYear = weekStart.find(part => part.type === 'year')?.value || '';
          const weekStartMonth = weekStart.find(part => part.type === 'month')?.value || '';
          const weekStartDay = weekStart.find(part => part.type === 'day')?.value || '';

          dateKey = `${weekStartYear}-${weekStartMonth}-${weekStartDay}`;
          break;

        case 'month':
          // Get the month in user's timezone
          const monthParts = monthFormatter.formatToParts(scanDate);
          const monthYear = monthParts.find(part => part.type === 'year')?.value || '';
          const monthValue = monthParts.find(part => part.type === 'month')?.value || '';

          dateKey = `${monthYear}-${monthValue}-01`;
          break;

        case 'day':
        default:
          // Get the day in user's timezone
          const parts = dateFormatter.formatToParts(scanDate);
          const dayYear = parts.find(part => part.type === 'year')?.value || '';
          const dayMonth = parts.find(part => part.type === 'month')?.value || '';
          const dayValue = parts.find(part => part.type === 'day')?.value || '';

          dateKey = `${dayYear}-${dayMonth}-${dayValue}`;
          break;
      }

      // Increment the count for this date key
      if (!groupedScans[dateKey]) {
        groupedScans[dateKey] = 0;
      }
      groupedScans[dateKey]++;
    });

    console.log('Grouped scans:', groupedScans);

    // Convert to array format for charts
    const result = Object.entries(groupedScans).map(([date, count]) => {
      let label: string = date;

      // Format the label based on interval
      if (interval === 'week') {
        const [year, month, day] = date.split('-').map(part => parseInt(part));

        // Create date objects for week start and end in user's timezone
        const weekStart = new Date(`${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T12:00:00`);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        // Format dates in user's timezone
        const weekStartStr = new Intl.DateTimeFormat('en-US', {
          timeZone: timezone,
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }).format(weekStart);

        const weekEndStr = new Intl.DateTimeFormat('en-US', {
          timeZone: timezone,
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }).format(weekEnd);

        label = `Week of ${weekStartStr} - ${weekEndStr}`;
      }
      else if (interval === 'month') {
        const [year, month] = date.split('-').map(part => parseInt(part));

        // Create a date for the month in user's timezone
        const monthDate = new Date(`${year}-${month.toString().padStart(2, '0')}-01T12:00:00`);

        // Format the month in user's timezone
        label = new Intl.DateTimeFormat('en-US', {
          timeZone: timezone,
          year: 'numeric',
          month: 'long'
        }).format(monthDate);
      }

      return {
        date,
        label,
        count,
      };
    });

    console.log('Final result:', result);
    return result;
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
