import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { KardexService } from './kardex.service';
import { FilterKardexDto } from './dto/filter-kardex.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('kardex')
export class KardexController {
  constructor(private readonly kardexService: KardexService) {}

  @Roles('ADMIN', 'BODEGA', 'LOGISTICA')
  @Get()
  findAll(@Req() req: Request, @Query() filter: FilterKardexDto) {
    const user = (req as any).user;
    return this.kardexService.findAll(filter, {
      userId: String(user?.sub ?? ''),
      role: user?.rol ?? null,
      bodegaId: user?.id_bodega ?? null,
    });
  }
}
