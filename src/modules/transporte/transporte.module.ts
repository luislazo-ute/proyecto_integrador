import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transporte } from './entities/transporte.entity';
import { TransporteService } from './transporte.service';
import { TransporteController } from './transporte.controller';
import { GuiaRemision } from '../guia-remision/entities/guia-remision.entity';
@Module({
    imports: [TypeOrmModule.forFeature([Transporte, GuiaRemision])],
    providers: [TransporteService],
    controllers: [TransporteController],
    exports: [TransporteService],
})
export class TransporteModule {
}
