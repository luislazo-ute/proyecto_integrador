import { Test, TestingModule } from '@nestjs/testing';
import { GuiaRemisionController } from './guia-remision.controller';

describe('GuiaRemisionController', () => {
  let controller: GuiaRemisionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GuiaRemisionController],
    }).compile();

    controller = module.get<GuiaRemisionController>(GuiaRemisionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
