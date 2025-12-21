import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ConductorService } from './conductor.service';
import { CreateConductorDto } from './dto/create-conductor.dto';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('conductor')
export class ConductorController {
  constructor(private svc: ConductorService) {}

  @Get() all() {
    return this.svc.findAll();
  }
  @Get(':id') one(@Param('id') id: string) {
    return this.svc.findOne(id);
  }
  @Post() create(@Body() dto: CreateConductorDto) {
    return this.svc.create(dto);
  }
  @Put(':id') update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateConductorDto>,
  ) {
    return this.svc.update(id, dto);
  }
  @Delete(':id') remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }
}
