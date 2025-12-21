import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { KardexService } from './kardex.service';
import { FilterKardexDto } from './dto/filter-kardex.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('kardex')
export class KardexController {
  constructor(private readonly kardexService: KardexService) {}

  @Get()
  findAll(@Query() filter: FilterKardexDto) {
    return this.kardexService.findAll(filter);
  }
}
