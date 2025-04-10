import { Test, TestingModule } from '@nestjs/testing';
import { LocalAuthGuardService } from './local-auth.guard.service';

describe('LocalAuthGuardService', () => {
  let service: LocalAuthGuardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LocalAuthGuardService],
    }).compile();

    service = module.get<LocalAuthGuardService>(LocalAuthGuardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
