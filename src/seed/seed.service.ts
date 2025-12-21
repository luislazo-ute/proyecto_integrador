import { Injectable, OnModuleInit } from '@nestjs/common';
import { RolService } from '../modules/rol/rol.service';
import { UsuarioService } from '../modules/usuario/usuario.service';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    private readonly rolService: RolService,
    private readonly usuarioService: UsuarioService,
  ) {}

  async onModuleInit() {
    console.log('🌱 Ejecutando seed inicial...');

    const roles = ['ADMIN', 'BODEGA', 'LOGISTICA'];
    const rolesDB: Record<string, { _id: string }> = {};

    for (const nombre of roles) {
      let rol = await this.rolService.findByNombre(nombre);
      if (!rol) {
        rol = await this.rolService.create({
          nombre,
          descripcion: `Rol ${nombre}`,
        });
        console.log(`✔ Rol creado: ${nombre}`);
      }
      rolesDB[nombre] = rol;
    }

    const admin = await this.usuarioService.findByUsername('admin');

    if (!admin) {
      await this.usuarioService.create({
        nombre: 'Administrador',
        username: 'admin',
        password: 'admin123',
        email: 'admin@computec.com',
        telefono: '0000000000',
        estado: true,
        id_rol: rolesDB['ADMIN']._id,
      });

      console.log('✔ Usuario admin creado');
    } else {
      console.log('ℹ Usuario admin ya existe');
    }
  }
}
