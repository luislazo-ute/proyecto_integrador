import { Module } from '@nestjs/common';
import { CategoriaService } from './categoria.service';
import { CategoriaController } from './categoria.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Categoria } from './entities/categoria.entity';

import { MongooseModule } from '@nestjs/mongoose';
import { CategoriaMongoose, CategoriaMongooseSchema } from './schemas/categoria.schema';

@Module({
  imports: [
    // POSTGRES
    TypeOrmModule.forFeature([Categoria]),

    // MONGODB
    MongooseModule.forFeature([
      {
        name: CategoriaMongoose.name,
        schema: CategoriaMongooseSchema,
      },
    ]),
  ],
  controllers: [CategoriaController],
  providers: [CategoriaService],
})
export class CategoriaModule {}
