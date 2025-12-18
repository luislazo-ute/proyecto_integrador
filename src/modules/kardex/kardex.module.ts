import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';

import { Kardex } from './entities/kardex.entity';
import { KardexMongo, KardexMongoSchema } from './schemas/kardex.schema';
import { KardexController } from './kardex.controller';
import { KardexService } from './kardex.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Kardex]),
    MongooseModule.forFeature([
      { name: KardexMongo.name, schema: KardexMongoSchema },
    ]),
  ],
  controllers: [KardexController],
  providers: [KardexService],
  exports: [KardexService],
})
export class KardexModule {}
