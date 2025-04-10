import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QrCode, QrCodeStatus, QrCodeType } from '../../../../data/src/lib/entities/qr-codes/qr-code.entity';
import { Repository } from 'typeorm';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { CreateQrCodeDto } from '../../../../data/src/lib/dto/qr-codes/create-qr-code.dto';
import { User, UserRole } from '../../../../data/src/lib/entities/users/user.entity';
import { UpdateQrCodeDto } from '../../../../data/src/lib/dto/qr-codes/update-qr-code.dto';
import * as QRCode from 'qrcode';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class QrCodesService {
  constructor(
    @InjectRepository(QrCode)
    private qrCodesRepository: Repository<QrCode>,
    private subscriptionsService: SubscriptionsService,
    private configService: ConfigService
  ) {}

  async create(createQrCodeDto: CreateQrCodeDto, user: User): Promise<QrCode> {
    // Check user's subscription status
    const subscription = await this.subscriptionsService.findOneByUserId(user.id);

    // Check if the user can create a dynamic QR code
    if (createQrCodeDto.type === QrCodeType.DYNAMIC && !subscription.isDynamicAllowed) {
      throw new ForbiddenException('Your subscription plan does not allow dynamic QR codes');
    }

    // Check if the user has reached the maximum number of QR codes
    const userQrCodesCount = await this.qrCodesRepository.count({ where: { user: { id: user.id } } });
    if (userQrCodesCount >= subscription.maxQrCodes) {
      throw new ForbiddenException('You have reached the maximum number of QR codes for your subscription plan');
    }

    // Set maxScans based on subscription if not provided
    if (!createQrCodeDto.maxScans && user.role === UserRole.FREE) {
      createQrCodeDto.maxScans = subscription.maxScansPerQr;
    }

    const qrCode = this.qrCodesRepository.create({
      ...createQrCodeDto,
      user,
    });

    return this.qrCodesRepository.save(qrCode);
  }

  async findAll(userId: string): Promise<QrCode[]> {
    return this.qrCodesRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<QrCode> {
    const qrCode = await this.qrCodesRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ['scans'],
    });

    if (!qrCode) {
      throw new NotFoundException(`QR code with ID ${id} not found`);
    }

    return qrCode;
  }

  async update(id: string, updateQrCodeDto: UpdateQrCodeDto, userId: string): Promise<QrCode> {
    const qrCode = await this.findOne(id, userId);

    // Check if the user is trying to change a static QR to dynamic
    if (qrCode.type === QrCodeType.STATIC && updateQrCodeDto.type === QrCodeType.DYNAMIC) {
      const subscription = await this.subscriptionsService.findOneByUserId(userId);
      if (!subscription.isDynamicAllowed) {
        throw new ForbiddenException('Your subscription plan does not allow dynamic QR codes');
      }
    }

    // Prevent updating the URL for static QR codes
    if (qrCode.type === QrCodeType.STATIC && updateQrCodeDto.targetUrl && updateQrCodeDto.targetUrl !== qrCode.targetUrl) {
      throw new ForbiddenException('Cannot update the URL of a static QR code');
    }

    Object.assign(qrCode, updateQrCodeDto);

    return this.qrCodesRepository.save(qrCode);
  }

  async remove(id: string, userId: string): Promise<void> {
    const qrCode = await this.findOne(id, userId);
    qrCode.status = QrCodeStatus.DELETED;
    await this.qrCodesRepository.save(qrCode);
  }

  generateQrCodeImage(qrCode: QrCode): Promise<string> {
    return new Promise((resolve, reject) => {
      const url = qrCode.type === QrCodeType.DYNAMIC
        ? `${this.configService.get('API_URL')}/api/redirect/${qrCode.id}`
        : qrCode.targetUrl;

      const options = {
        errorCorrectionLevel: 'M',
        margin: 4,
        width: qrCode.size === 'small' ? 200 : qrCode.size === 'medium' ? 300 : 400,
        color: {
          dark: qrCode.designOptions?.darkColor || '#000000',
          light: qrCode.designOptions?.lightColor || '#ffffff',
        },
      };

      // ✅ Use callback-based QRCode.toDataURL
      // @ts-ignore
      QRCode.toDataURL(url, options, (error, dataUrl) => {
        if (error) {
          console.error('QR generation error:', error);
          reject(error);
        } else {
          resolve(dataUrl);
        }
      });
    });
  }

  async incrementScanCount(qrCodeId: string): Promise<QrCode> {
    const qrCode = await this.qrCodesRepository.findOne({ where: { id: qrCodeId } });

    if (!qrCode) {
      throw new NotFoundException(`QR code with ID ${qrCodeId} not found`);
    }

    // Check if QR code is active
    if (qrCode.status !== QrCodeStatus.ACTIVE) {
      throw new ForbiddenException('This QR code is no longer active');
    }

    // Check if maximum scans limit has been reached
    if (qrCode.maxScans > 0 && qrCode.scanCount >= qrCode.maxScans) {
      qrCode.status = QrCodeStatus.LOCKED;
      await this.qrCodesRepository.save(qrCode);
      throw new ForbiddenException('This QR code has reached its maximum number of scans');
    }

    // Increment scan count
    qrCode.scanCount += 1;

    // Check if the scan count just reached the maximum limit
    if (qrCode.maxScans > 0 && qrCode.scanCount >= qrCode.maxScans) {
      qrCode.status = QrCodeStatus.LOCKED;
    }

    return this.qrCodesRepository.save(qrCode);
  }
}
