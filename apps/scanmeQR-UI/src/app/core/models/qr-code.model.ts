export enum QrCodeType {
  STATIC = 'static',
  DYNAMIC = 'dynamic',
}

export enum QrCodeSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
}

export enum QrCodeStatus {
  ACTIVE = 'active',
  LOCKED = 'locked',
  DELETED = 'deleted',
}

export interface QrCodeDesignOptions {
  darkColor?: string;
  lightColor?: string;
  logo?: string;
}

export interface QrCode {
  id: string;
  name: string;
  type: QrCodeType;
  targetUrl: string;
  designOptions?: QrCodeDesignOptions;
  size: QrCodeSize;
  status: QrCodeStatus;
  scanCount: number;
  maxScans: number;
  createdAt: Date;
  updatedAt: Date;
  imagePath?: string;
}

export interface QrCodePreview {
  previewUrl: string;
}

export interface QrCodeStats {
  totalScans: number;
  activeQrCodes: number;
  totalVisits: number;
  subscriptionStatus: string;
}
