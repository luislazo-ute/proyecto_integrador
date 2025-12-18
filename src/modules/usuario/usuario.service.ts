// src/modules/usuario/usuario.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Usuario } from './entities/usuario.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UsuarioMongo, UsuarioDocument } from './schemas/usuario.schema';
import { Rol } from '../rol/entities/rol.entity';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,

    @InjectRepository(Rol)
    private readonly rolRepo: Repository<Rol>,

    @InjectModel(UsuarioMongo.name)
    private readonly usuarioMongoModel: Model<UsuarioDocument>,
  ) {}

  async create(dto: CreateUsuarioDto) {
    const rol = await this.rolRepo.findOne({ where: { id_rol: dto.id_rol } });
    if (!rol) throw new NotFoundException('Rol no existe');

    // 🔹 Postgres
    const usuario = this.usuarioRepo.create(dto);
    const saved = await this.usuarioRepo.save(usuario);

    // 🔹 Mongo (espejo)
    await this.usuarioMongoModel.create({
      id_usuario: saved.id_usuario,
      id_rol: saved.id_rol,
      nombre: saved.nombre,
      username: saved.username,
      password: saved.password,
      email: saved.email,
      telefono: saved.telefono,
      estado: saved.estado,
    });

    return saved;
  }

  findAll() {
    return this.usuarioRepo.find();
  }

  findOne(id: number) {
    return this.usuarioRepo.findOne({ where: { id_usuario: id } });
  }
}
