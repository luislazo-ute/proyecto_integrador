import { Test, TestingModule } from '@nestjs/testing';
import { TransporteController } from './transporte.controller';

describe('TransporteController', () => {
  let controller: TransporteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransporteController],
    }).compile();

    controller = module.get<TransporteController>(TransporteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
