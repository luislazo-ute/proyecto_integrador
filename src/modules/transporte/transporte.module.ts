import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transporte } from './entities/transporte.entity';
import { TransporteService } from './transporte.service';
import { TransporteController } from './transporte.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Transporte])],
  providers: [TransporteService],
  controllers: [TransporteController],
  exports: [TransporteService],
})
export class TransporteModule {}
