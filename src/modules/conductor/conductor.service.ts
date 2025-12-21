import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conductor } from './entities/conductor.entity';
import { CreateConductorDto } from './dto/create-conductor.dto';

@Injectable()
export class ConductorService {
  constructor(
    @InjectRepository(Conductor) private repo: Repository<Conductor>,
  ) {}

  findAll() {
    return this.repo.find();
  }

  async findOne(id: string) {
    const c = await this.repo.findOne({ where: { id_conductor: id } });
    if (!c) throw new NotFoundException('Conductor no encontrado');
    return c;
  }

  create(dto: CreateConductorDto) {
    const ent = this.repo.create(dto);
    return this.repo.save(ent);
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
