import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { MovimientoInventarioService } from './movimiento-inventario.service';
import { CreateMovimientoDto } from './dto/create-movimiento.dto';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('movimiento-inventario')
export class MovimientoInventarioController {
  constructor(
    private readonly movimientoService: MovimientoInventarioService,
  ) {}

  @Post()
  create(@Body() dto: CreateMovimientoDto) {
    return this.movimientoService.create(dto);
  }

  @Get()
  findAll() {
    return this.movimientoService.findAll();
  }
}
