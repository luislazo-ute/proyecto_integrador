import { Module } from '@nestjs/common';
import { BodegaService } from './bodega.service';
import { BodegaController } from './bodega.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bodega } from './entities/bodega.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Bodega])],
  controllers: [BodegaController],
  providers: [BodegaService],
})
export class BodegaModule {}
