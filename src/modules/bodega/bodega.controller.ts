import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { BodegaService } from './bodega.service';
import { CreateBodegaDto } from './dto/create-bodega.dto';
import { UpdateBodegaDto } from './dto/update-bodega.dto';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('bodega')
export class BodegaController {
  constructor(private readonly bodegaService: BodegaService) {}

  @Roles('ADMIN', 'BODEGA', 'LOGISTICA')
  @Get()
  findAll(@Req() req: Request) {
    const user = (req as any).user;
    return this.bodegaService.findAll({
      userId: String(user?.sub ?? ''),
      role: user?.rol ?? null,
      bodegaId: user?.id_bodega ?? null,
    });
  }

  @Roles('ADMIN', 'BODEGA', 'LOGISTICA')
  @Get(':id')
  findOne(@Req() req: Request, @Param('id') id: string) {
    const user = (req as any).user;
    return this.bodegaService.findOne(id, {
      userId: String(user?.sub ?? ''),
      role: user?.rol ?? null,
      bodegaId: user?.id_bodega ?? null,
    });
  }

  @Roles('ADMIN')
  @Post()
  create(@Body() data: CreateBodegaDto) {
    return this.bodegaService.create(data);
  }

  @Roles('ADMIN')
  @Put(':id')
  update(@Param('id') id: string, @Body() data: UpdateBodegaDto) {
    return this.bodegaService.update(id, data);
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bodegaService.remove(id);
  }
}
