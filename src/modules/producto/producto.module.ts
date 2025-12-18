import { Module } from '@nestjs/common';
import { ProductoService } from './producto.service';
import { ProductoController } from './producto.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Producto } from './entities/producto.entity';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ProductoMongo,
  ProductoMongoSchema,
} from './schemas/producto.schema';

@Module({
  imports: [
    TypeOrmModule.forFeature([Producto]),
    MongooseModule.forFeature([
      { name: ProductoMongo.name, schema: ProductoMongoSchema },
    ]),
  ],
  controllers: [ProductoController],
  providers: [ProductoService],
})
export class ProductoModule {}
