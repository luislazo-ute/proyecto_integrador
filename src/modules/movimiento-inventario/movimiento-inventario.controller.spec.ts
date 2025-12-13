import { Test, TestingModule } from '@nestjs/testing';
import { MovimientoInventarioController } from './movimiento-inventario.controller';

describe('MovimientoInventarioController', () => {
  let controller: MovimientoInventarioController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MovimientoInventarioController],
    }).compile();

    controller = module.get<MovimientoInventarioController>(MovimientoInventarioController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
