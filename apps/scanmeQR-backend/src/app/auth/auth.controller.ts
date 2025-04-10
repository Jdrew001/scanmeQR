import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { AuthService } from '../../../../../shared/services/src/lib/auth/auth.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LocalAuthGuard } from '../../../../../shared/util/src/lib/auth/guards/local-auth.guard';
import { LoginDto } from '../../../../../shared/data/src/lib/dto/auth/login.dto';
import { RegisterDto } from '../../../../../shared/data/src/lib/dto/auth/register.dto';
import { JwtAuthGuard } from '../../../../../shared/util/src/lib/auth/guards/jwt-auth.guard';
import { RefreshAuthGuardService } from '../../../../../shared/services/src/lib/auth/guards/refresh-auth.guard.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'User successfully logged in' })
  async login(@Body() loginDto: LoginDto, @Request() req: any) {
    return this.authService.login(req.user);
  }

  @Post('register')
  @ApiOperation({ summary: 'User registration' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'Return user profile' })
  getProfile(@Request() req) {
    return this.authService.getProfile(req.user.id);
  }

  @UseGuards(RefreshAuthGuardService)
  @Post('refresh')
  refreshTokens(@Request() req) {
    const userId = req.user.id;
    const refreshToken = req.user.refreshToken;
    return this.authService.refreshTokens(userId, refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Request() req) {
    return this.authService.logout(req.user.id);
  }
}
