import { Test, TestingModule } from '@nestjs/testing';
import { BodegaController } from './bodega.controller';

describe('BodegaController', () => {
  let controller: BodegaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BodegaController],
    }).compile();

    controller = module.get<BodegaController>(BodegaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
