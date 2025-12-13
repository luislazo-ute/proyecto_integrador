import { Controller, Get, Post, Body } from '@nestjs/common';
import { MovimientoInventarioService } from './movimiento-inventario.service';
import { CreateMovimientoDto } from './dto/create-movimiento.dto';

@Controller('movimiento-inventario')
export class MovimientoInventarioController {
  constructor(private readonly movimientoService: MovimientoInventarioService) {}

  @Post()
  create(@Body() dto: CreateMovimientoDto) {
    return this.movimientoService.create(dto);
  }

  @Get()
  findAll() {
    return this.movimientoService.findAll();
  }
}
