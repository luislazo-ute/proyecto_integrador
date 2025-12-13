import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conductor } from './entities/conductor.entity';
import { ConductorService } from './conductor.service';
import { ConductorController } from './conductor.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Conductor])],
  providers: [ConductorService],
  controllers: [ConductorController],
  exports: [ConductorService],
})
export class ConductorModule {}
