import { Body, Controller, Get, Request, Param, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../../../shared/util/src/lib/auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from '../../../../../shared/services/src/lib/users/users.service';
import { User } from '../../../../../shared/data/src/lib/entities/users/user.entity';
import { UpdateUserDto } from '../../../../../shared/data/src/lib/dto/users/update-user.dto';

@ApiTags('users')
@Controller('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Return all users.', type: [User] })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'Return the user.', type: User })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'The user has been successfully updated.', type: User })
  updateProfile(@Body() updateUserDto: UpdateUserDto, @Request() req) {
    return this.usersService.update(req.user.id, updateUserDto);
  }
}
