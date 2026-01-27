import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { GuiaRemisionService } from './guia-remision.service';
import { CreateGuiaDto } from './dto/create-guia.dto';
import { AddDetalleGuiaDto } from './dto/add-detalle-guia.dto';
import { FilterGuiaDto } from './dto/filter-guia.dto';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('guia-remision')
export class GuiaRemisionController {
  constructor(private readonly svc: GuiaRemisionService) {}

  @Post()
  create(@Body() dto: CreateGuiaDto) {
    return this.svc.create(dto);
  }

  @Post('detalle')
  addDetalle(@Body() dto: AddDetalleGuiaDto) {
    return this.svc.addDetalle(dto);
  }

  @Put(':id/enviar')
  enviar(@Param('id') id: string) {
    return this.svc.enviar(id);
  }

  @Put(':id/finalizar')
  finalizar(@Param('id') id: string) {
    return this.svc.finalizar(id);
  }

  @Get()
  list(@Query() filter: FilterGuiaDto) {
    return this.svc.findAll(filter);
  }

  @Get(':id')
  one(@Param('id') id: string) {
    return this.svc.findOne(id);
  }
}
