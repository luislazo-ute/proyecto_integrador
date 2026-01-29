import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GuiaRemision } from './entities/guia-remision.entity';
import { DetalleGuiaRemision } from './entities/detalle-guia.entity';
import { GuiaRemisionService } from './guia-remision.service';
import { GuiaRemisionController } from './guia-remision.controller';
import { Producto } from '../producto/entities/producto.entity';
import { RutaEntrega } from '../ruta-entrega/entities/ruta-entrega.entity';
import { Transporte } from '../transporte/entities/transporte.entity';
import { Conductor } from '../conductor/entities/conductor.entity';
@Module({
    imports: [
        TypeOrmModule.forFeature([
            GuiaRemision,
            DetalleGuiaRemision,
            Producto,
            RutaEntrega,
            Transporte,
            Conductor,
        ]),
    ],
    controllers: [GuiaRemisionController],
    providers: [GuiaRemisionService],
})
export class GuiaRemisionModule {
}
