import { Test, TestingModule } from '@nestjs/testing';
import { TransporteService } from './transporte.service';

describe('TransporteService', () => {
  let service: TransporteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TransporteService],
    }).compile();

    service = module.get<TransporteService>(TransporteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
