import { Controller, ForbiddenException, Param, Post, UseGuards, Request, Response } from '@nestjs/common';
import { MasqueradeService } from '../../../../../shared/services/src/lib/masquerade/masquerade.service';
import { JwtAuthGuardService } from '../../../../../shared/services/src/lib/auth/guards/jwt-auth.guard.service';
import { UserRole } from '../../../../../shared/data/src/lib/entities/users/user.entity';

@Controller('auth/masquerade')
export class MasqueradeController {
  constructor(private masqueradeService: MasqueradeService) {}

  @UseGuards(JwtAuthGuardService)
  @Post('start/:userId')
  async startMasquerade(@Request() req, @Param('userId') targetUserId: string) {
    // Check if user is admin
    if (req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only administrators can masquerade as other users');
    }
    return this.masqueradeService.masqueradeAs(req.user.id, targetUserId);
  }

  @UseGuards(JwtAuthGuardService)
  @Post('end')
  async endMasquerade(@Request() req) {
    // Check if user is currently masquerading
    if (!req.user.masquerading || !req.user.originalUserId) {
      throw new ForbiddenException('Not currently masquerading');
    }
    return this.masqueradeService.endMasquerade(req.user.id, req.user.originalUserId);
  }
}
