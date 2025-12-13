import { Test, TestingModule } from '@nestjs/testing';
import { KardexController } from './kardex.controller';

describe('KardexController', () => {
  let controller: KardexController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KardexController],
    }).compile();

    controller = module.get<KardexController>(KardexController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
