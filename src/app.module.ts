import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
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
import { StockBodegaModule } from './modules/stock-bodega/stock-bodega.module';
const envFilePath = process.env.NODE_ENV
    ? [`.env.${process.env.NODE_ENV}`, '.env']
    : ['.env'];
@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true, cache: true, envFilePath }),
        MongooseModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => {
                const uri = config.get<string>('MONGO_URI') ??
                    config.get<string>('MONGODB_URI') ??
                    '';
                if (!uri) {
                    throw new Error('Falta configurar MONGO_URI (o MONGODB_URI) en el entorno/.env');
                }
                return { uri };
            },
        }),
        SeedModule,
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                type: 'postgres',
                host: config.get<string>('DB_HOST') || 'localhost',
                port: parseInt(config.get<string>('DB_PORT') || '5432', 10),
                username: config.get<string>('DB_USER') || 'postgres',
                password: config.get<string>('DB_PASS') || '',
                database: config.get<string>('DB_NAME') || 'computec_backend_nuevo',
                autoLoadEntities: true,
                synchronize: config.get<string>('TYPEORM_SYNCHRONIZE') === 'true',
                logging: false,
            }),
        }),
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
        StockBodegaModule,
    ],
})
export class AppModule {
}
