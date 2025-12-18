// src/modules/bodega/bodega.module.ts

import { Module } from '@nestjs/common';
import { BodegaService } from './bodega.service';
import { BodegaController } from './bodega.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bodega as BodegaEntity } from './entities/bodega.entity'; // Alias para TypeORM
import { MongooseModule } from '@nestjs/mongoose'; // <-- [NUEVO]
import { BodegaMongoose, BodegaMongooseSchema } from './schemas/bodega.schema'; // <-- [NUEVO]

@Module({
  imports: [
    // Configuración TypeORM (Se mantiene intacta)
    TypeOrmModule.forFeature([BodegaEntity]), 

    // NUEVA IMPLEMENTACIÓN DE MONGODB
    MongooseModule.forFeature([
      { 
        name: BodegaMongoose.name, 
        schema: BodegaMongooseSchema,
      },
    ]),
  ],
  controllers: [BodegaController],
  providers: [BodegaService],
})
export class BodegaModule {}