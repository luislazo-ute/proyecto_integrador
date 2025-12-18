import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';

import { RutaEntrega } from './entities/ruta-entrega.entity';
import { DetalleRuta } from './entities/detalle-ruta.entity';
import { RutaEntregaService } from './ruta-entrega.service';
import { RutaEntregaController } from './ruta-entrega.controller';
import { Producto } from '../producto/entities/producto.entity';
import { Transporte } from '../transporte/entities/transporte.entity';

import {
  RutaEntregaMongo,
  RutaEntregaMongoSchema,
} from './schemas/ruta-entrega.schema';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RutaEntrega,
      DetalleRuta,
      Producto,
      Transporte,
    ]),

    // 🔹 MongoDB
    MongooseModule.forFeature([
      {
        name: RutaEntregaMongo.name,
        schema: RutaEntregaMongoSchema,
      },
    ]),
  ],
  providers: [RutaEntregaService],
  controllers: [RutaEntregaController],
})
export class RutaEntregaModule {}
