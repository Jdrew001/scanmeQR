import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import { User } from '../users/user.entity';
import { QrCodeScan } from '../analytics/qr-code-scan.entity';

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

@Entity()
export class QrCode {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ type: 'enum', enum: QrCodeType, default: QrCodeType.STATIC })
  type!: QrCodeType;

  @Column()
  targetUrl!: string;

  @Column({ type: 'json', nullable: true })
  designOptions!: Record<string, any>;

  @Column({ type: 'enum', enum: QrCodeSize, default: QrCodeSize.MEDIUM })
  size!: QrCodeSize;

  @Column({ type: 'enum', enum: QrCodeStatus, default: QrCodeStatus.ACTIVE })
  status!: QrCodeStatus;

  @Column({ default: 0 })
  scanCount!: number;

  @Column({ nullable: true })
  maxScans!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => User, user => user.qrCodes)
  user!: User;

  @OneToMany(() => QrCodeScan, scan => scan.qrCode)
  scans!: QrCodeScan[];

  @Column({ nullable: true })
  imagePath: string;
}
