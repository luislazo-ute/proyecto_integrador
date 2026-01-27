import { Controller, Get, Post, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { MovimientoInventarioService } from './movimiento-inventario.service';
import { CreateMovimientoDto } from './dto/create-movimiento.dto';
import { CreateEntradaDto } from './dto/create-entrada.dto';
import { FilterMovimientoDto } from './dto/filter-movimiento.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('movimiento-inventario')
export class MovimientoInventarioController {
  constructor(private readonly movimientoService: MovimientoInventarioService) {}

  @Roles('ADMIN', 'BODEGA')
  @Post()
  create(@Req() req: Request, @Body() dto: CreateMovimientoDto) {
    const user = (req as any).user; // viene de JwtStrategy.validate()
    return this.movimientoService.createTransfer(dto, {
      userId: user?.sub,
      role: user?.rol ?? null,
    });
  }

  @Roles('ADMIN', 'BODEGA')
  @Post('entrada')
  createEntrada(@Req() req: Request, @Body() dto: CreateEntradaDto) {
    const user = (req as any).user;
    return this.movimientoService.createEntrada(dto, {
      userId: user?.sub,
      role: user?.rol ?? null,
    });
  }

  @Roles('ADMIN', 'BODEGA')
  @Get()
  findAll(@Query() filter: FilterMovimientoDto) {
    return this.movimientoService.findAll(filter);
  }

  @Roles('ADMIN', 'BODEGA')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.movimientoService.findOne(id);
  }
}
