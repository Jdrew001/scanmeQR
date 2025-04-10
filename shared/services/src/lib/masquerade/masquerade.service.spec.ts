import { Test, TestingModule } from '@nestjs/testing';
import { MasqueradeService } from './masquerade.service';

describe('MasqueradeService', () => {
  let service: MasqueradeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MasqueradeService],
    }).compile();

    service = module.get<MasqueradeService>(MasqueradeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
