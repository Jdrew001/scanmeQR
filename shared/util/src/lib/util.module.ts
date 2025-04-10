import { Module } from '@nestjs/common';
import { TimezoneService } from './timezone/timezone.service';
import { ServicesModule } from '../../../services/src';
import { UsersService } from '../../../services/src/lib/users/users.service';
import { UsersModule } from '../../../../apps/scanmeQR-backend/src/app/users/users.module';

@Module({
  controllers: [],
  imports: [UsersModule],
  providers: [TimezoneService],
  exports: [TimezoneService],
})
export class UtilModule {}
