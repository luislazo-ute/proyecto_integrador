import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RutaEntrega } from './entities/ruta-entrega.entity';
import { DetalleRuta } from './entities/detalle-ruta.entity';
import { RutaEntregaService } from './ruta-entrega.service';
import { RutaEntregaController } from './ruta-entrega.controller';
import { Producto } from '../producto/entities/producto.entity';
import { Transporte } from '../transporte/entities/transporte.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([RutaEntrega, DetalleRuta, Producto, Transporte]),
  ],
  providers: [RutaEntregaService],
  controllers: [RutaEntregaController],
})
export class RutaEntregaModule {}
