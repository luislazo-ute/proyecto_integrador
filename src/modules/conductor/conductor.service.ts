import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conductor } from './entities/conductor.entity';
import { CreateConductorDto } from './dto/create-conductor.dto';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConductorMongoose, ConductorDocument } from './schemas/conductor.schema';

@Injectable()
export class ConductorService {
  constructor(
    // POSTGRES
    @InjectRepository(Conductor)
    private readonly repo: Repository<Conductor>,

    // MONGODB
    @InjectModel(ConductorMongoose.name)
    private readonly conductorMongoModel: Model<ConductorDocument>,
  ) {}

  findAll() {
    return this.repo.find();
  }

  async findOne(id: string) {
    const c = await this.repo.findOne({ where: { id_conductor: id } });
    if (!c) throw new NotFoundException('Conductor no encontrado');
    return c;
  }

  async create(dto: CreateConductorDto) {
    const ent = this.repo.create(dto as any);
    const savedConductor = await this.repo.save(ent);
    await this.conductorMongoModel.create({
      nombre: dto.nombre,
      cedula: dto.cedula,
      telefono: dto.telefono,
      licencia: dto.licencia,
      estado: dto.estado ?? true,
    });

    return savedConductor;
  }

  async update(id: string, dto: Partial<CreateConductorDto>) {
    const c = await this.findOne(id);
    Object.assign(c, dto);
    return this.repo.save(c);
  }

  async remove(id: string) {
    const c = await this.findOne(id);
    return this.repo.remove(c);
  }
}
