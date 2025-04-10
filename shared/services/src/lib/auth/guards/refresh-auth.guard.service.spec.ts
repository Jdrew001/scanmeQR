import { Test, TestingModule } from '@nestjs/testing';
import { RefreshAuthGuardService } from './refresh-auth.guard.service';

describe('RefreshAuthGuardService', () => {
  let service: RefreshAuthGuardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RefreshAuthGuardService],
    }).compile();

    service = module.get<RefreshAuthGuardService>(RefreshAuthGuardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
