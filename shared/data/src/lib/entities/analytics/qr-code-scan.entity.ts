import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { QrCode } from '../qr-codes/qr-code.entity';

@Entity()
export class QrCodeScan {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ nullable: true })
  ipAddress!: string;

  @Column({ nullable: true })
  userAgent!: string;

  @Column({ nullable: true })
  referer!: string;

  @Column({ nullable: true })
  country!: string;

  @Column({ nullable: true })
  city!: string;

  @Column({ nullable: true })
  device!: string;

  @Column({ nullable: true })
  browser!: string;

  @Column({ nullable: true })
  os!: string;

  @CreateDateColumn()
  scanDate!: Date;

  @ManyToOne(() => QrCode, qrCode => qrCode.scans)
  qrCode!: QrCode;
}
