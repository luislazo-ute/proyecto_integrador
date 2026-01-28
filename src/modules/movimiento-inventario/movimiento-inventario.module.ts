import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MovimientoInventarioService } from './movimiento-inventario.service';
import { MovimientoInventarioController } from './movimiento-inventario.controller';

import { Movimiento } from './entities/movimiento.entity';
import { MovimientoDetalle } from './entities/movimiento-detalle.entity';
import { MovimientoInventario } from './entities/movimiento-inventario.entity';

import { StockBodega } from 'src/modules/stock-bodega/entities/stock-bodega.entity';
import { Producto } from 'src/modules/producto/entities/producto.entity';
import { Bodega } from 'src/modules/bodega/entities/bodega.entity';
import { Kardex } from 'src/modules/kardex/entities/kardex.entity';

import { UsuarioModule } from 'src/modules/usuario/usuario.module';
import { MovimientoSeq } from './entities/movimiento_seq.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Movimiento,
      MovimientoDetalle,
      MovimientoInventario,
      MovimientoSeq,
      StockBodega,
      Producto,
      Bodega,
      Kardex,
    ]),
    UsuarioModule, // ✅ para usar UsuarioService
  ],
  controllers: [MovimientoInventarioController],
  providers: [MovimientoInventarioService],
})
export class MovimientoInventarioModule {}
