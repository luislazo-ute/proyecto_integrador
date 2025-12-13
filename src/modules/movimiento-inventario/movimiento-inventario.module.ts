import { Module } from '@nestjs/common';
import { MovimientoInventarioService } from './movimiento-inventario.service';
import { MovimientoInventarioController } from './movimiento-inventario.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MovimientoInventario } from './entities/movimiento-inventario.entity';
import { Producto } from '../producto/entities/producto.entity';
import { Kardex } from '../kardex/entities/kardex.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MovimientoInventario, Producto, Kardex])],
  controllers: [MovimientoInventarioController],
  providers: [MovimientoInventarioService],
})
export class MovimientoInventarioModule {}
