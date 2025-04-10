import { IsString, IsEnum, IsUrl, IsOptional, IsInt, Min, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { QrCodeSize, QrCodeType } from '../../entities/qr-codes/qr-code.entity';

export class CreateQrCodeDto {
  @ApiProperty({ description: 'Name of the QR code' })
  @IsString()
  name!: string;

  @ApiProperty({ enum: QrCodeType, enumName: 'QrCodeType', description: 'Type of QR code' })
  @IsEnum(QrCodeType)
  type!: QrCodeType;

  @ApiProperty({ description: 'Target URL that the QR code will redirect to' })
  @IsUrl()
  targetUrl!: string;

  @ApiProperty({ enum: QrCodeSize, enumName: 'QrCodeSize', description: 'Size of the QR code' })
  @IsEnum(QrCodeSize)
  size!: QrCodeSize;

  @ApiProperty({ description: 'Design options for the QR code', required: false })
  @IsOptional()
  @IsObject()
  designOptions?: Record<string, any>;

  @ApiProperty({ description: 'Maximum number of scans allowed (0 for unlimited)', required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  maxScans?: number;
}
