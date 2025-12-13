import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { TransporteService } from './transporte.service';
import { CreateTransporteDto } from './dto/create-transporte.dto';

@Controller('transporte')
export class TransporteController {
  constructor(private svc: TransporteService) {}

  @Get() all() { return this.svc.findAll(); }
  @Get(':id') one(@Param('id') id: string) { return this.svc.findOne(id); }
  @Post() create(@Body() dto: CreateTransporteDto) { return this.svc.create(dto); }
  @Put(':id') update(@Param('id') id: string, @Body() dto: Partial<CreateTransporteDto>) { return this.svc.update(id, dto); }
  @Delete(':id') remove(@Param('id') id: string) { return this.svc.remove(id); }
}
