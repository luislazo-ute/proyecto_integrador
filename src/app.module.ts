import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';

// Importar todos los módulos del sistema
import { BodegaModule } from './modules/bodega/bodega.module';
import { CategoriaModule } from './modules/categoria/categoria.module';
import { ProductoModule } from './modules/producto/producto.module';
import { MovimientoInventarioModule } from './modules/movimiento-inventario/movimiento-inventario.module';
import { KardexModule } from './modules/kardex/kardex.module';
import { TransporteModule } from './modules/transporte/transporte.module';
import { ConductorModule } from './modules/conductor/conductor.module';
import { RutaEntregaModule } from './modules/ruta-entrega/ruta-entrega.module';
import { GuiaRemisionModule } from './modules/guia-remision/guia-remision.module';

@Module({
  imports: [
    // Habilita las variables de entorno
    ConfigModule.forRoot({ isGlobal: true }),

    // Conexión a PostgreSQL
    TypeOrmModule.forRoot(typeOrmConfig),

    // Módulos del sistema
    BodegaModule,
    CategoriaModule,
    ProductoModule,
    MovimientoInventarioModule,
    KardexModule,
    TransporteModule,
    ConductorModule,
    RutaEntregaModule,
    GuiaRemisionModule,
  ],
})
export class AppModule {}
