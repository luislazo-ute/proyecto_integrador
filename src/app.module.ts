import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';
import { BodegaModule } from './modules/bodega/bodega.module';
import { CategoriaModule } from './modules/categoria/categoria.module';
import { ProductoModule } from './modules/producto/producto.module';
import { MovimientoInventarioModule } from './modules/movimiento-inventario/movimiento-inventario.module';
import { KardexModule } from './modules/kardex/kardex.module';
import { TransporteModule } from './modules/transporte/transporte.module';
import { ConductorModule } from './modules/conductor/conductor.module';
import { RutaEntregaModule } from './modules/ruta-entrega/ruta-entrega.module';
import { GuiaRemisionModule } from './modules/guia-remision/guia-remision.module';
import { MongooseModule } from '@nestjs/mongoose';
import { SeedModule } from './seed/seed.module';
import { AuthModule } from './auth/auth.module';
import { RolModule } from './modules/rol/rol.module';
import { UsuarioModule } from './modules/usuario/usuario.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot('mongodb://localhost:27017/computec_backend_nuevo'),
    SeedModule,
    TypeOrmModule.forRoot(typeOrmConfig),
    AuthModule,
    RolModule,
    UsuarioModule,
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
