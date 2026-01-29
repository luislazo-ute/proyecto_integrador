import { Controller, Post, Get, Delete, Param, Body, UseGuards, Put, } from '@nestjs/common';
import { RolService } from './rol.service';
import { CreateRolDto } from './dto/create-rol.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('rol')
export class RolController {
    constructor(private readonly rolService: RolService) { }
    @Post()
    create(
    @Body()
    dto: CreateRolDto) {
        return this.rolService.create(dto);
    }
    @Get()
    findAll() {
        return this.rolService.findAll();
    }
    @Get(':id')
    findOne(
    @Param('id')
    id: string) {
        return this.rolService.findOne(id);
    }
    @Put(':id')
    update(
    @Param('id')
    id: string, 
    @Body()
    dto: Record<string, unknown>) {
        return this.rolService.update(id, dto);
    }
    @Delete(':id')
    remove(
    @Param('id')
    id: string) {
        return this.rolService.remove(id);
    }
}
