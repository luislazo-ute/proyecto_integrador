// src/modules/ruta-entrega/ruta-entrega.controller.ts
import { Controller, Get, Post, Body, Param, Put } from '@nestjs/common';
import { RutaEntregaService } from './ruta-entrega.service';
import { CreateRutaDto } from './dto/create-ruta.dto';
import { AddDetalleRutaDto } from './dto/add-detalle-ruta.dto';

@Controller('ruta-entrega')
export class RutaEntregaController {
  constructor(private readonly svc: RutaEntregaService) {}

  @Post()
  create(@Body() dto: CreateRutaDto) {
    return this.svc.create(dto);
  }

  @Post('detalle')
  addDetalle(@Body() dto: AddDetalleRutaDto) {
    return this.svc.addDetalle(dto);
  }

  @Put(':id/confirmar')
  confirmar(@Param('id') id: string) {
    return this.svc.confirmRoute(id);
  }

  @Put(':id/finalizar')
  finalizar(@Param('id') id: string) {
    return this.svc.finalizeRoute(id);
  }

  @Get()
  list() {
    return this.svc.findAll();
  }

  @Get(':id')
  one(@Param('id') id: string) {
    return this.svc.findOne(id);
  }
}
