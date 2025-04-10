import { Controller, Get, Post, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../../shared/util/src/lib/auth/guards/jwt-auth.guard';
import { SubscriptionsService } from '../../../../../shared/services/src/lib/subscriptions/subscriptions.service';
import { Subscription } from 'rxjs';

@ApiTags('subscriptions')
@Controller('subscriptions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user subscription' })
  @ApiResponse({ status: 200, description: 'Return the subscription.', type: Subscription })
  findOne(@Request() req) {
    return this.subscriptionsService.findOneByUserId(req.user.id);
  }

  @Post('upgrade')
  @ApiOperation({ summary: 'Upgrade to premium subscription' })
  @ApiResponse({ status: 200, description: 'The subscription has been upgraded.', type: Subscription })
  upgradeToPremium(@Request() req) {
    return this.subscriptionsService.upgradeToPremium(req.user.id);
  }

  @Post('downgrade')
  @ApiOperation({ summary: 'Downgrade to free subscription' })
  @ApiResponse({ status: 200, description: 'The subscription has been downgraded.', type: Subscription })
  downgradeToFree(@Request() req) {
    return this.subscriptionsService.downgradeToFree(req.user.id);
  }
}
