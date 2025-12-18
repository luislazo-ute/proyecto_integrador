import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conductor } from './entities/conductor.entity';
import { ConductorService } from './conductor.service';
import { ConductorController } from './conductor.controller';

import { MongooseModule } from '@nestjs/mongoose';
import { ConductorMongoose, ConductorMongooseSchema } from './schemas/conductor.schema';

@Module({
  imports: [
    // POSTGRES
    TypeOrmModule.forFeature([Conductor]),

    // MONGODB
    MongooseModule.forFeature([
      {
        name: ConductorMongoose.name,
        schema: ConductorMongooseSchema,
      },
    ]),
  ],
  providers: [ConductorService],
  controllers: [ConductorController],
  exports: [ConductorService],
})
export class ConductorModule {}
