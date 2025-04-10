import { IsEnum, IsOptional, IsDateString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SubscriptionPlan, SubscriptionStatus } from '../../entities/subscriptions/subscription.entity';

export class CreateSubscriptionDto {
  @ApiProperty({ enum: SubscriptionPlan, enumName: 'SubscriptionPlan' })
  @IsEnum(SubscriptionPlan)
  plan!: SubscriptionPlan;

  @ApiProperty({ required: true })
  @IsUUID()
  userId!: string;

  @ApiProperty({ enum: SubscriptionStatus, enumName: 'SubscriptionStatus', required: false })
  @IsEnum(SubscriptionStatus)
  @IsOptional()
  status?: SubscriptionStatus;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  startDate?: Date;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  endDate?: Date;
}
