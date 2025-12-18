import { Controller, Get, Param } from '@nestjs/common';
import { KardexService } from './kardex.service';

@Controller('kardex')
export class KardexController {
  constructor(private readonly svc: KardexService) {}

  @Get('producto/:id_producto')
  async getByProducto(@Param('id_producto') id_producto: string) {
    return this.svc.obtenerPorProducto(id_producto);
  }
}
