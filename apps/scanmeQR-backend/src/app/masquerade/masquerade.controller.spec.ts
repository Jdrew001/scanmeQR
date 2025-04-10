import { Test, TestingModule } from '@nestjs/testing';
import { MasqueradeController } from './masquerade.controller';

describe('MasqueradeController', () => {
  let controller: MasqueradeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MasqueradeController],
    }).compile();

    controller = module.get<MasqueradeController>(MasqueradeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
