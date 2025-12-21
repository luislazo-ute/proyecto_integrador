import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { RolModule } from '../modules/rol/rol.module';
import { UsuarioModule } from '../modules/usuario/usuario.module';

@Module({
  imports: [RolModule, UsuarioModule],
  providers: [SeedService],
})
export class SeedModule {}
