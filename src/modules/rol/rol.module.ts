// src/modules/rol/rol.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';

import { Rol } from './entities/rol.entity';
import { RolMongo, RolSchema } from './schemas/rol.schema';
import { RolService } from './rol.service';
import { RolController } from './rol.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Rol]),
    MongooseModule.forFeature([
      { name: RolMongo.name, schema: RolSchema },
    ]),
  ],
  controllers: [RolController],
  providers: [RolService],
  exports: [RolService],
})
export class RolModule {}
