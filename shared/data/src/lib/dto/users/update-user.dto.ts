import { PartialType } from '@nestjs/swagger';
import { IsString, IsOptional, MinLength, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../entities/users/user.entity';
import { Subscription } from '../../entities/subscriptions/subscription.entity';

export class UpdateUserDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @MinLength(6)
  password?: string;

  @ApiProperty({ required: false, enum: UserRole })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @ApiProperty({ required: false, description: 'Refresh token for JWT authentication' })
  @IsString()
  @IsOptional()
  refreshToken?: string | null;
}
