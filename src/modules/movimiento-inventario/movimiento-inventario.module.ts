import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';

import { MovimientoInventarioService } from './movimiento-inventario.service';
import { MovimientoInventarioController } from './movimiento-inventario.controller';

import { MovimientoInventario } from './entities/movimiento-inventario.entity';
import { Producto } from '../producto/entities/producto.entity';
import { Bodega } from '../bodega/entities/bodega.entity';
import { Kardex } from '../kardex/entities/kardex.entity';

import {
  MovimientoInventarioMongo,
  MovimientoInventarioSchema,
} from './schemas/movimiento-inventario.schema';

import { KardexModule } from '../kardex/kardex.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MovimientoInventario,
      Producto,
      Bodega,
      Kardex,
    ]),
    MongooseModule.forFeature([
      {
        name: MovimientoInventarioMongo.name,
        schema: MovimientoInventarioSchema,
      },
    ]),
    KardexModule,
  ],
  controllers: [MovimientoInventarioController],
  providers: [MovimientoInventarioService],
})
export class MovimientoInventarioModule {}
