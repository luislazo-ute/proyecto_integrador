// src/modules/rol/rol.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Rol } from './entities/rol.entity';
import { CreateRolDto } from './dto/create-rol.dto';
import { RolMongo, RolDocument } from './schemas/rol.schema';

@Injectable()
export class RolService {
  constructor(
    @InjectRepository(Rol)
    private readonly rolRepo: Repository<Rol>,

    @InjectModel(RolMongo.name)
    private readonly rolMongoModel: Model<RolDocument>,
  ) {}

  async create(dto: CreateRolDto) {
    // 🔹 Guardar en Postgres
    const rol = this.rolRepo.create(dto);
    const saved = await this.rolRepo.save(rol);

    // 🔹 Espejo en Mongo
    await this.rolMongoModel.create({
      id_rol: saved.id_rol,
      nombre: saved.nombre,
      descripcion: saved.descripcion,
    });

    return saved;
  }

  findAll() {
    return this.rolRepo.find();
  }

  findOne(id: number) {
    return this.rolRepo.findOne({ where: { id_rol: id } });
  }
}
