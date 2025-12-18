import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Transporte } from './entities/transporte.entity';
import { CreateTransporteDto } from './dto/create-transporte.dto';
import { TransporteMongo, TransporteDocument } from './schemas/transporte.schema';

@Injectable()
export class TransporteService {
  constructor(
    @InjectRepository(Transporte)
    private repo: Repository<Transporte>,

    // 🔹 Mongo
    @InjectModel(TransporteMongo.name)
    private transporteMongoModel: Model<TransporteDocument>,
  ) {}

  findAll() {
    return this.repo.find();
  }

  async findOne(id: string) {
    const t = await this.repo.findOne({ where: { id_transporte: id } });
    if (!t) throw new NotFoundException('Transporte no encontrado');
    return t;
  }

  async create(dto: CreateTransporteDto) {
    // 🔹 Postgres
    const ent: Transporte = this.repo.create(dto);
    const saved: Transporte = await this.repo.save(ent);

    // 🔹 Mongo (COPIA)
    await this.transporteMongoModel.create({
      id_transporte: saved.id_transporte,
      placa: saved.placa,
      tipo_vehiculo: saved.tipo_vehiculo,
      capacidad: Number(saved.capacidad),
      estado: saved.estado,
    });

    return saved;
  }

  async update(id: string, dto: Partial<CreateTransporteDto>) {
    const t = await this.findOne(id);
    Object.assign(t, dto);
    const saved: Transporte = await this.repo.save(t);

    await this.transporteMongoModel.updateOne(
      { id_transporte: id },
      {
        placa: saved.placa,
        tipo_vehiculo: saved.tipo_vehiculo,
        capacidad: Number(saved.capacidad),
        estado: saved.estado,
      },
    );

    return saved;
  }

  async remove(id: string) {
    const t = await this.findOne(id);
    await this.repo.remove(t);

    await this.transporteMongoModel.deleteOne({ id_transporte: id });

    return { mensaje: 'Transporte eliminado' };
  }

  async setEstado(id: string, estado: string) {
    const t = await this.findOne(id);
    t.estado = estado;
    const saved: Transporte = await this.repo.save(t);

    await this.transporteMongoModel.updateOne(
      { id_transporte: id },
      { estado },
    );

    return saved;
  }
}
