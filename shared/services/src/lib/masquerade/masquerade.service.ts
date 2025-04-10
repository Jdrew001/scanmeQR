import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '../../../../data/src/lib/entities/users/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class MasqueradeService {
  private logger = new Logger('MasqueradeService');

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async masqueradeAs(adminId: string, targetUserId: string) {
    // Verify admin permissions
    const admin = await this.usersService.findOne(adminId);
    if (admin.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only administrators can masquerade as other users');
    }

    // Get target user
    const targetUser = await this.usersService.findOne(targetUserId);
    if (!targetUser) {
      throw new NotFoundException(`User with ID ${targetUserId} not found`);
    }

    this.logger.warn(`Admin ${adminId} (${admin.email}) started masquerading as user ${targetUserId} (${targetUser.email})`);

    // Generate masquerade tokens
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: targetUser.id,
          email: targetUser.email,
          role: targetUser.role,
          masquerading: true,
          originalUserId: adminId
        },
        {
          secret: process.env.JWT_ACCESS_SECRET,
          expiresIn: '1h', // Short duration for security
        },
      ),
      this.jwtService.signAsync(
        {
          sub: targetUser.id,
          email: targetUser.email,
          role: targetUser.role,
          masquerading: true,
          originalUserId: adminId
        },
        {
          secret: process.env.JWT_REFRESH_SECRET,
          expiresIn: '2h', // Slightly longer but still limited for security
        },
      ),
    ]);

    // Store temp masquerade info in admin user
    // This helps with audit and ensures we can properly end masquerade session
    await this.usersService.update(adminId, {
      masqueradingAs: targetUserId,
      masqueradeStartTime: new Date()
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: targetUser.id,
        email: targetUser.email,
        firstName: targetUser.firstName,
        lastName: targetUser.lastName,
        role: targetUser.role,
      },
      masquerading: true,
      originalUserId: adminId
    };
  }

  async endMasquerade(currentUserId: string, originalUserId: string) {
    // Verify the original user exists
    const originalUser = await this.usersService.findOne(originalUserId);
    if (!originalUser) {
      throw new NotFoundException('Original user not found');
    }

    // Generate tokens for the original user
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: originalUser.id,
          email: originalUser.email,
          role: originalUser.role
        },
        {
          secret: process.env.JWT_ACCESS_SECRET,
          expiresIn: '15m',
        },
      ),
      this.jwtService.signAsync(
        {
          sub: originalUser.id,
          email: originalUser.email,
          role: originalUser.role
        },
        {
          secret: process.env.JWT_REFRESH_SECRET,
          expiresIn: '7d',
        },
      ),
    ]);

    // Store the refresh token hash for the original user
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.usersService.update(originalUser.id, {
      refreshToken: hashedRefreshToken,
      masqueradingAs: null,
      masqueradeStartTime: null
    });

    this.logger.warn(`Admin ${originalUserId} (${originalUser.email}) stopped masquerading as user ${currentUserId}`);

    return {
      accessToken,
      refreshToken,
      user: {
        id: originalUser.id,
        email: originalUser.email,
        firstName: originalUser.firstName,
        lastName: originalUser.lastName,
        role: originalUser.role,
      },
      masquerading: false
    };
  }

  async refreshMasqueradingTokens(userId: string, refreshToken: string, originalUserId: string) {
    // Verify both users exist
    const [currentUser, originalUser] = await Promise.all([
      this.usersService.findOne(userId),
      this.usersService.findOne(originalUserId)
    ]);

    if (!currentUser || !originalUser) {
      throw new NotFoundException('User not found');
    }

    // Verify original user is an admin
    if (originalUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Original user must be an administrator');
    }

    // Generate new masquerade tokens
    const [newAccessToken, newRefreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: currentUser.id,
          email: currentUser.email,
          role: currentUser.role,
          masquerading: true,
          originalUserId: originalUser.id
        },
        {
          secret: process.env.JWT_ACCESS_SECRET,
          expiresIn: '1h',
        },
      ),
      this.jwtService.signAsync(
        {
          sub: currentUser.id,
          email: currentUser.email,
          role: currentUser.role,
          masquerading: true,
          originalUserId: originalUser.id
        },
        {
          secret: process.env.JWT_REFRESH_SECRET,
          expiresIn: '2h',
        },
      ),
    ]);

    this.logger.warn(`Refreshed masquerade tokens for admin ${originalUserId} masquerading as ${userId}`);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      masquerading: true,
      originalUserId: originalUser.id
    };
  }
}
