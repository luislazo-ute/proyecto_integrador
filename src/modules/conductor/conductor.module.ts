import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conductor } from './entities/conductor.entity';
import { ConductorSeq } from './entities/conductor_seq.entity';
import { ConductorService } from './conductor.service';
import { ConductorController } from './conductor.controller';
import { GuiaRemision } from '../guia-remision/entities/guia-remision.entity';
@Module({
    imports: [TypeOrmModule.forFeature([Conductor, ConductorSeq, GuiaRemision])],
    providers: [ConductorService],
    controllers: [ConductorController],
    exports: [ConductorService],
})
export class ConductorModule {
}
