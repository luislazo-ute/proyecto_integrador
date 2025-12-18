import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bodega as BodegaEntity } from './entities/bodega.entity';
import { CreateBodegaDto } from './dto/create-bodega.dto';
import { UpdateBodegaDto } from './dto/update-bodega.dto';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BodegaMongoose, BodegaDocument } from './schemas/bodega.schema';

@Injectable()
export class BodegaService {
  constructor(
    // POSTGRES (SE MANTIENE)
    @InjectRepository(BodegaEntity)
    private readonly bodegaRepository: Repository<BodegaEntity>,

    // MONGODB
    @InjectModel(BodegaMongoose.name)
    private readonly bodegaMongoModel: Model<BodegaDocument>,
  ) {}

  // ================= POSTGRES + MONGODB =================

  async findAll() {
    return await this.bodegaRepository.find();
  }

  async findOne(id: string) {
    const bodega = await this.bodegaRepository.findOne({
      where: { id_bodega: id },
    });

    if (!bodega) {
      throw new NotFoundException(`La bodega con id ${id} no existe.`);
    }

    return bodega;
  }

  async create(data: CreateBodegaDto) {
    // 1️⃣ Guardar en POSTGRES (como siempre)
    const bodega = this.bodegaRepository.create(data);
    const savedBodega = await this.bodegaRepository.save(bodega);

    // 2️⃣ Guardar en MONGODB (NUEVO)
    await this.bodegaMongoModel.create({
      nombre: data.nombre,
      ubicacion: data.ubicacion,
      responsable: data.responsable,
    });

    // 3️⃣ Respuesta normal (Postgres)
    return savedBodega;
  }

  async update(id: string, data: UpdateBodegaDto) {
    const bodega = await this.findOne(id);
    Object.assign(bodega, data);
    return await this.bodegaRepository.save(bodega);
  }

  async remove(id: string) {
    const bodega = await this.findOne(id);
    return await this.bodegaRepository.remove(bodega);
  }
}
