import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from '../../../../../shared/services/src/lib/users/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../../../../shared/data/src/lib/entities/users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
