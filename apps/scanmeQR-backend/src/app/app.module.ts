import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { QrCodesModule } from './qr-codes/qr-codes.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { RedirectController } from './redirect/redirect.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QrCodeScan } from '../../../../shared/data/src/lib/entities/analytics/qr-code-scan.entity';
import { QrCode } from '../../../../shared/data/src/lib/entities/qr-codes/qr-code.entity';
import {
  Subscription,
  SubscriptionPlan,
} from '../../../../shared/data/src/lib/entities/subscriptions/subscription.entity';
import {
  User,
  UserRole,
} from '../../../../shared/data/src/lib/entities/users/user.entity';
import { UsersService } from '../../../../shared/services/src/lib/users/users.service';
import { SubscriptionsService } from '../../../../shared/services/src/lib/subscriptions/subscriptions.service';
import { MasqueradeController } from './masquerade/masquerade.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'password'),
        database: configService.get('DB_NAME', 'qrcode_db'),
        entities: [QrCodeScan, QrCode, Subscription, User],
        synchronize: true,
        logging: true,
        logger: 'advanced-console',
      }),
    }),
    AuthModule,
    UsersModule,
    QrCodesModule,
    SubscriptionsModule,
    AnalyticsModule,
  ],
  controllers: [AppController, RedirectController, MasqueradeController],
  providers: [AppService],
})
export class AppModule {
  constructor(
    private usersService: UsersService,
    private subscriptionsService: SubscriptionsService
  ) {}

  async onModuleInit() {
    await this.seedUsers();
  }

  private async seedUsers() {
    try {
      // Check if users already exist
      const users = await this.usersService.findAll();

      // Only seed if no users exist
      if (users.length === 0) {
        console.log('Seeding users...');

        // Create admin user
        const admin = await this.usersService.create({
          email: 'admin@example.com',
          password: 'admin123',
          firstName: 'Admin',
          lastName: 'User',
          role: UserRole.ADMIN,
        });

        // Create free user
        const freeUser = await this.usersService.create({
          email: 'free@example.com',
          password: 'free123',
          firstName: 'Free',
          lastName: 'User',
          role: UserRole.FREE,
        });

        // Create subscription for free user
        await this.subscriptionsService.create({
          userId: freeUser.id,
          plan: SubscriptionPlan.FREE,
        });

        // Create premium user
        const premiumUser = await this.usersService.create({
          email: 'premium@example.com',
          password: 'premium123',
          firstName: 'Premium',
          lastName: 'User',
          role: UserRole.PREMIUM,
        });

        // Create subscription for premium user
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1);

        await this.subscriptionsService.create({
          userId: premiumUser.id,
          plan: SubscriptionPlan.PREMIUM,
          startDate: new Date(),
          endDate: endDate,
        });

        console.log('Seeded users successfully!');
      } else {
        console.log('Users already exist, skipping seed.');
      }
    } catch (error) {
      console.error('Error seeding users:', error);
    }
  }
}
