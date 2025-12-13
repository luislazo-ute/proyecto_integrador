import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { BodegaService } from './bodega.service';
import { CreateBodegaDto } from './dto/create-bodega.dto';
import { UpdateBodegaDto } from './dto/update-bodega.dto';

@Controller('bodega')
export class BodegaController {
  constructor(private readonly bodegaService: BodegaService) {}

  @Get()
  findAll() {
    return this.bodegaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bodegaService.findOne(id);
  }

  @Post()
  create(@Body() data: CreateBodegaDto) {
    return this.bodegaService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: UpdateBodegaDto) {
    return this.bodegaService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bodegaService.remove(id);
  }
}
