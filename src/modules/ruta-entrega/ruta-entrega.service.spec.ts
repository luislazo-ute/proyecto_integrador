import { Test, TestingModule } from '@nestjs/testing';
import { RutaEntregaService } from './ruta-entrega.service';

describe('RutaEntregaService', () => {
  let service: RutaEntregaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RutaEntregaService],
    }).compile();

    service = module.get<RutaEntregaService>(RutaEntregaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
