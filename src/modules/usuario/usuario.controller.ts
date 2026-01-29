import { Controller, Post, Get, Put, Delete, Param, Body, UseGuards, } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { ParseIdPipe } from '../../common/pipes/parse-id.pipe';
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('usuario')
export class UsuarioController {
    constructor(private readonly usuarioService: UsuarioService) { }
    @Roles('ADMIN', 'BODEGA', 'LOGISTICA')
    @Get('responsables')
    responsables() {
        return this.usuarioService.listResponsables();
    }
    @Roles('ADMIN')
    @Post()
    create(
    @Body()
    dto: CreateUsuarioDto) {
        return this.usuarioService.create(dto);
    }
    @Roles('ADMIN')
    @Get()
    findAll() {
        return this.usuarioService.findAll();
    }
    @Roles('ADMIN')
    @Get(':id')
    findOne(
    @Param('id', ParseIdPipe)
    id: string) {
        return this.usuarioService.findOne(id);
    }
    @Roles('ADMIN')
    @Put(':id')
    update(
    @Param('id', ParseIdPipe)
    id: string, 
    @Body()
    dto: UpdateUsuarioDto) {
        return this.usuarioService.update(id, dto);
    }
    @Roles('ADMIN')
    @Delete(':id')
    remove(
    @Param('id', ParseIdPipe)
    id: string) {
        return this.usuarioService.remove(id);
    }
}
