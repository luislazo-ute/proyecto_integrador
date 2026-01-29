import { Injectable, OnModuleInit } from '@nestjs/common';
import { RolService } from '../modules/rol/rol.service';
import { UsuarioService } from '../modules/usuario/usuario.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bodega } from 'src/modules/bodega/entities/bodega.entity';
@Injectable()
export class SeedService implements OnModuleInit {
    constructor(private readonly rolService: RolService, private readonly usuarioService: UsuarioService, 
    @InjectRepository(Bodega)
    private readonly bodegaRepo: Repository<Bodega>) { }
    async onModuleInit() {
        await this.seed();
    }
    async seed() {
        console.log('🌱 Ejecutando seed inicial...');
        const roles = ['ADMIN', 'BODEGA', 'LOGISTICA'] as const;
        const rolesDB: Record<string, {
            _id: string;
        }> = {};
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
        let principal = await this.bodegaRepo.findOne({ where: { nombre: 'Bodega Principal' } });
        if (!principal) {
            principal = await this.bodegaRepo.save(this.bodegaRepo.create({
                nombre: 'Bodega Principal',
                ubicacion: 'Matriz',
                responsable: null,
            }));
            console.log('✔ Bodega Principal creada');
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
                id_bodega: principal.id_bodega,
            });
            console.log('✔ Usuario admin creado');
            return;
        }
        if (!admin.id_bodega) {
            await this.usuarioService.updateByUsername('admin', {
                id_bodega: principal.id_bodega,
            });
            console.log('ℹ Admin actualizado con Bodega Principal');
        }
        else {
            console.log('ℹ Usuario admin ya existe');
        }
    }
}
