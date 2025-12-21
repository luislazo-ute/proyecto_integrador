import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Rol, RolSchema } from './schemas/rol.schema';
import { RolService } from './rol.service';
import { RolController } from './rol.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Rol.name, schema: RolSchema }])],
  providers: [RolService],
  exports: [RolService],
  controllers: [RolController],
})
export class RolModule {}
