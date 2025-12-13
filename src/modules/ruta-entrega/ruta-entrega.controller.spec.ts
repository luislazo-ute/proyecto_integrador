import { Test, TestingModule } from '@nestjs/testing';
import { RutaEntregaController } from './ruta-entrega.controller';

describe('RutaEntregaController', () => {
  let controller: RutaEntregaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RutaEntregaController],
    }).compile();

    controller = module.get<RutaEntregaController>(RutaEntregaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
