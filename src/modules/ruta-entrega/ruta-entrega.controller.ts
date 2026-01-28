// src/modules/ruta-entrega/ruta-entrega.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  UseGuards,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { RutaEntregaService } from './ruta-entrega.service';
import { CreateRutaDto } from './dto/create-ruta.dto';
import { AddDetalleRutaDto } from './dto/add-detalle-ruta.dto';
import { UpdateRutaDto } from './dto/update-ruta.dto';
import { ImportMovimientoDto } from './dto/import-movimiento.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
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

  @Post(':id/importar-movimiento')
  importarMovimiento(@Param('id') id: string, @Body() dto: ImportMovimientoDto) {
    return this.svc.importMovimiento(id, dto);
  }

  @Put(':id/confirmar')
  confirmar(@Param('id') id: string, @Req() req: Request) {
    const userId = (req as any)?.user?.sub as string | undefined;
    return this.svc.confirmRoute(id, userId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRutaDto) {
    return this.svc.update(id, dto);
  }

  @Put(':id/cancelar')
  cancelar(@Param('id') id: string) {
    return this.svc.cancelRoute(id);
  }

  @Put(':id/finalizar')
  finalizar(@Param('id') id: string, @Req() req: Request) {
    const userId = (req as any)?.user?.sub as string | undefined;
    return this.svc.finalizeRoute(id, userId);
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
