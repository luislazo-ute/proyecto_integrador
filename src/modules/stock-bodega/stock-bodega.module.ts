import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockBodega } from './entities/stock-bodega.entity';
import { StockBodegaController } from './stock-bodega.controller';
import { StockBodegaService } from './stock-bodega.service';
import { UsuarioModule } from '../usuario/usuario.module';
@Module({
    imports: [TypeOrmModule.forFeature([StockBodega]), UsuarioModule],
    controllers: [StockBodegaController],
    providers: [StockBodegaService],
    exports: [TypeOrmModule, StockBodegaService],
})
export class StockBodegaModule {
}
