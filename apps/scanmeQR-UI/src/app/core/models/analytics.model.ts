export interface QrCodeScan {
  id: string;
  ipAddress: string;
  userAgent: string;
  referer: string;
  country: string;
  city: string;
  device: string;
  browser: string;
  os: string;
  scanDate: Date;
}

export interface DailyScans {
  date: string;
  label: string;
  count: number;
}

export interface DeviceBreakdown {
  device: string;
  count: number;
}

export interface BrowserBreakdown {
  browser: string;
  count: number;
}

export interface OsBreakdown {
  os: string;
  count: number;
}

export interface ScanFilterOptions {
  startDate?: string;
  endDate?: string;
  interval?: 'day' | 'week' | 'month';
  timezone?: string;
}

export interface RecentActivity {
  id: string;
  type: 'scan' | 'create' | 'subscription';
  description: string;
  qrCodeId?: string;
  qrCodeName?: string;
  activityDate: Date;
}
