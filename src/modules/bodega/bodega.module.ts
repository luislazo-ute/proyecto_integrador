import { Module } from '@nestjs/common';
import { BodegaService } from './bodega.service';
import { BodegaController } from './bodega.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bodega } from './entities/bodega.entity';
import { StockBodega } from '../stock-bodega/entities/stock-bodega.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { Usuario, UsuarioSchema } from '../usuario/schemas/usuario.schema';
import { Rol, RolSchema } from '../rol/schemas/rol.schema';
@Module({
    imports: [
        TypeOrmModule.forFeature([Bodega, StockBodega]),
        MongooseModule.forFeature([{ name: Usuario.name, schema: UsuarioSchema }]),
        MongooseModule.forFeature([{ name: Rol.name, schema: RolSchema }]),
    ],
    controllers: [BodegaController],
    providers: [BodegaService],
})
export class BodegaModule {
}
