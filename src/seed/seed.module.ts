import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { RolModule } from '../modules/rol/rol.module';
import { UsuarioModule } from '../modules/usuario/usuario.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bodega } from 'src/modules/bodega/entities/bodega.entity';
@Module({
    imports: [RolModule, UsuarioModule, TypeOrmModule.forFeature([Bodega])],
    providers: [SeedService],
})
export class SeedModule {
}
