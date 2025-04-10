import { Test, TestingModule } from '@nestjs/testing';
import { RefreshStrategyService } from './refresh.strategy.service';

describe('RefreshStrategyService', () => {
  let service: RefreshStrategyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RefreshStrategyService],
    }).compile();

    service = module.get<RefreshStrategyService>(RefreshStrategyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
