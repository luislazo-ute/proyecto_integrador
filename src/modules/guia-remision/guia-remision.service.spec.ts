import { Test, TestingModule } from '@nestjs/testing';
import { GuiaRemisionService } from './guia-remision.service';

describe('GuiaRemisionService', () => {
  let service: GuiaRemisionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GuiaRemisionService],
    }).compile();

    service = module.get<GuiaRemisionService>(GuiaRemisionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
