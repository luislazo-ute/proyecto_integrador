import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';

import { Transporte } from './entities/transporte.entity';
import { TransporteService } from './transporte.service';
import { TransporteController } from './transporte.controller';
import { TransporteMongo, TransporteSchema } from './schemas/transporte.schema';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transporte]),
    MongooseModule.forFeature([
      { name: TransporteMongo.name, schema: TransporteSchema },
    ]),
  ],
  providers: [TransporteService],
  controllers: [TransporteController],
  exports: [TransporteService],
})
export class TransporteModule {}
