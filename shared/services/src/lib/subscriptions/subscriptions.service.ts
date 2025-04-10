import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import {
  SubscriptionPlan,
  SubscriptionStatus,
  Subscription
} from '../../../../data/src/lib/entities/subscriptions/subscription.entity';
import { CreateSubscriptionDto } from '../../../../data/src/lib/dto/subscriptions/create-subscription.dto';
import { User, UserRole } from '../../../../data/src/lib/entities/users/user.entity';
import { UpdateSubscriptionDto } from '../../../../data/src/lib/dto/subscriptions/update-subscription.dto';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionsRepository: Repository<Subscription>,
    private usersService: UsersService,
  ) {}

  async create(createSubscriptionDto: CreateSubscriptionDto): Promise<Subscription> {
    const user = await this.usersService.findOne(createSubscriptionDto.userId);

    // Set subscription limits based on plan
    let maxQrCodes = 5;
    let maxScansPerQr = 100;
    let isDynamicAllowed = false;

    if (createSubscriptionDto.plan === SubscriptionPlan.PREMIUM) {
      maxQrCodes = 100;
      maxScansPerQr = 0; // Unlimited
      isDynamicAllowed = true;

      // Update user role to premium
      await this.usersService.update(user.id, { role: UserRole.PREMIUM });
    }

    // Set default dates if not provided
    const startDate = createSubscriptionDto.startDate || new Date();
    let endDate = createSubscriptionDto.endDate;

    if (!endDate && createSubscriptionDto.plan === SubscriptionPlan.PREMIUM) {
      // Set end date to 1 month from start date for premium users
      endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
    }

    // Create new subscription or find existing one
    let subscription = await this.subscriptionsRepository.findOne({
      where: {
        plan: createSubscriptionDto.plan,
        status: createSubscriptionDto.status || SubscriptionStatus.ACTIVE
      }
    });

    // If no matching subscription exists, create a new one
    if (!subscription) {
      subscription = this.subscriptionsRepository.create({
        plan: createSubscriptionDto.plan,
        status: createSubscriptionDto.status || SubscriptionStatus.ACTIVE,
        maxQrCodes,
        maxScansPerQr,
        isDynamicAllowed,
        startDate,
        endDate,
      });
      subscription = await this.subscriptionsRepository.save(subscription);
    }

    // Associate user with this subscription
    await this.updateSubscription(user.id, subscription.id);

    return subscription;
  }

  async findAll(): Promise<Subscription[]> {
    return this.subscriptionsRepository.find({
      relations: ['users'],
    });
  }

  async findOne(id: string): Promise<Subscription> {
    const subscription = await this.subscriptionsRepository.findOne({
      where: { id },
      relations: ['users'],
    });

    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }

    return subscription;
  }

  async findOneByUserId(userId: string): Promise<Subscription> {
    const user = await this.usersService.findOne(userId);

    if (!user.subscription) {
      throw new NotFoundException(`Subscription for user with ID ${userId} not found`);
    }

    return user.subscription;
  }

  async update(id: string, updateSubscriptionDto: UpdateSubscriptionDto): Promise<Subscription> {
    const subscription = await this.findOne(id);

    // Update limits based on plan if it's changed
    if (updateSubscriptionDto.plan && updateSubscriptionDto.plan !== subscription.plan) {
      if (updateSubscriptionDto.plan === SubscriptionPlan.PREMIUM) {
        // Update limits for premium
        updateSubscriptionDto['maxQrCodes'] = 100;
        updateSubscriptionDto['maxScansPerQr'] = 0;
        updateSubscriptionDto['isDynamicAllowed'] = true;

        // Update all users with this subscription to premium role
        for (const user of subscription.users) {
          await this.usersService.update(user.id, { role: UserRole.PREMIUM });
        }
      } else if (updateSubscriptionDto.plan === SubscriptionPlan.FREE) {
        // Update limits for free
        updateSubscriptionDto['maxQrCodes'] = 5;
        updateSubscriptionDto['maxScansPerQr'] = 100;
        updateSubscriptionDto['isDynamicAllowed'] = false;

        // Update all users with this subscription to free role
        for (const user of subscription.users) {
          await this.usersService.update(user.id, { role: UserRole.FREE });
        }
      }
    }

    Object.assign(subscription, updateSubscriptionDto);

    return this.subscriptionsRepository.save(subscription);
  }

  async remove(id: string): Promise<void> {
    const subscription = await this.findOne(id);
    await this.subscriptionsRepository.remove(subscription);
  }

  async upgradeToPremium(userId: string): Promise<Subscription> {
    const user = await this.usersService.findOne(userId);

    // Find or create a premium subscription
    let premiumSubscription = await this.subscriptionsRepository.findOne({
      where: {
        plan: SubscriptionPlan.PREMIUM,
        status: SubscriptionStatus.ACTIVE
      }
    });

    if (!premiumSubscription) {
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);

      premiumSubscription = this.subscriptionsRepository.create({
        plan: SubscriptionPlan.PREMIUM,
        status: SubscriptionStatus.ACTIVE,
        startDate,
        endDate,
        maxQrCodes: 100,
        maxScansPerQr: 0,
        isDynamicAllowed: true,
      });
      premiumSubscription = await this.subscriptionsRepository.save(premiumSubscription);
    }

    // Update user to premium role and assign premium subscription
    await this.updateSubscription(user.id, premiumSubscription.id);

    return premiumSubscription;
  }

  async downgradeToFree(userId: string): Promise<Subscription> {
    const user = await this.usersService.findOne(userId);

    // Find or create a free subscription
    let freeSubscription = await this.subscriptionsRepository.findOne({
      where: {
        plan: SubscriptionPlan.FREE,
        status: SubscriptionStatus.ACTIVE
      }
    });

    if (!freeSubscription) {
      freeSubscription = this.subscriptionsRepository.create({
        plan: SubscriptionPlan.FREE,
        status: SubscriptionStatus.ACTIVE,
        maxQrCodes: 5,
        maxScansPerQr: 100,
        isDynamicAllowed: false,
      });
      freeSubscription = await this.subscriptionsRepository.save(freeSubscription);
    }

    // Update user to free role and assign free subscription
    await this.updateSubscription(user.id, freeSubscription.id);

    return freeSubscription;
  }

  async updateSubscription(userId: string, subscriptionId: string): Promise<User> {
    const user = await this.usersService.findOne(userId);
    const subscription = await this.findOne(subscriptionId);

    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${subscriptionId} not found`);
    }

    user.subscription = subscription;
    return this.usersService.updateUserModel(user);
  }
}
