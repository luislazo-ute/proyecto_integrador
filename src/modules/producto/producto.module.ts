import { Module } from '@nestjs/common';
import { ProductoService } from './producto.service';
import { ProductoController } from './producto.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Producto } from './entities/producto.entity';
import { Categoria } from 'src/modules/categoria/entities/categoria.entity';
import { ProductoCodigoSeq } from './entities/producto_codigo_seq.entity';

import { StockBodega } from '../stock-bodega/entities/stock-bodega.entity';
import { Bodega } from '../bodega/entities/bodega.entity';

import { MongooseModule } from '@nestjs/mongoose';
import { Usuario, UsuarioSchema } from '../usuario/schemas/usuario.schema';

@Module({
  imports: [
    TypeOrmModule.forFeature([Producto, Categoria, ProductoCodigoSeq, StockBodega, Bodega]),
    MongooseModule.forFeature([{ name: Usuario.name, schema: UsuarioSchema }]),
  ],
  controllers: [ProductoController],
  providers: [ProductoService],
})
export class ProductoModule {}
