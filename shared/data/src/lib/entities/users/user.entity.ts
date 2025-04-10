import {
  Column,
  CreateDateColumn,
  Entity, ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import { QrCode } from '../qr-codes/qr-code.entity';
import { Subscription } from '../subscriptions/subscription.entity';

export enum UserRole {
  FREE = 'free',
  PREMIUM = 'premium',
  ADMIN = 'admin',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password?: string;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.FREE })
  role!: UserRole;

  @Column({ default: false })
  isEmailVerified!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => QrCode, qrCode => qrCode.user)
  qrCodes!: QrCode[];

  @ManyToOne(() => Subscription, subscription => subscription.users)
  subscription!: Subscription;

  @Column({ nullable: true })
  refreshToken: string;
}
