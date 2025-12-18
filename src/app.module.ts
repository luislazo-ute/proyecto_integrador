// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config'; // <-- Importamos ConfigService
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';
import { MongooseModule } from '@nestjs/mongoose'; // <-- Importamos MongooseModule

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
import { RolModule } from './modules/rol/rol.module';
import { UsuarioModule } from './modules/usuario/usuario.module';

@Module({
  imports: [
    // Habilita las variables de entorno
    ConfigModule.forRoot({ isGlobal: true }),

    // Conexión a PostgreSQL
    TypeOrmModule.forRoot(typeOrmConfig),

    // ---------- NUEVA CONEXIÓN A MONGODB (Mongoose) ----------
    MongooseModule.forRootAsync({
      imports: [ConfigModule], // Requerido para inyectar ConfigService
      useFactory: async (configService: ConfigService) => ({
        // Usamos la variable que definiste: MONGO_URI=mongodb://localhost:27017/computecdb
        uri: configService.get<string>('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),
    // ----------------------------------------------------

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
    RolModule,
    UsuarioModule,
  ],
})
export class AppModule {}