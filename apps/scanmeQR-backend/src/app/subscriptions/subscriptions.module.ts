import { Module } from '@nestjs/common';
import { SubscriptionsController } from './subscriptions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { SubscriptionsService } from '../../../../../shared/services/src/lib/subscriptions/subscriptions.service';
import { Subscription } from '../../../../../shared/data/src/lib/entities/subscriptions/subscription.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Subscription]),
    UsersModule,
  ],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
