import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { StockBodegaService } from './stock-bodega.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('stock-bodega')
export class StockBodegaController {
  constructor(private readonly stockService: StockBodegaService) {}

  @Roles('ADMIN', 'BODEGA', 'LOGISTICA')
  @Get(':id_bodega')
  findByBodega(@Req() req: Request, @Param('id_bodega') id_bodega: string) {
    const user = (req as any).user;
    return this.stockService.findByBodega(id_bodega, {
      userId: user?.sub,
      role: user?.rol ?? null,
    });
  }
}
